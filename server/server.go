package main

import (
	"context"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/FachschaftMathPhysInfo/pepp/server/auth"
	database "github.com/FachschaftMathPhysInfo/pepp/server/db"
	"github.com/FachschaftMathPhysInfo/pepp/server/directives"
	"github.com/FachschaftMathPhysInfo/pepp/server/email"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/FachschaftMathPhysInfo/pepp/server/ical"
	"github.com/FachschaftMathPhysInfo/pepp/server/maintenance"
	"github.com/FachschaftMathPhysInfo/pepp/server/tracing"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/ravilushqa/otelgqlgen"
	"github.com/riandyrn/otelchi"
	"github.com/robfig/cron/v3"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

const (
	defaultPort     = "8080"
	sessionIdHeader = "SID"
)

var (
	resolver      graph.Resolver
	port          = os.Getenv("PORT")
	env           = os.Getenv("ENV")
	enableTracing = os.Getenv("ENABLE_TRACING") == "true"
)

func main() {
	ctx := context.Background()

	if port == "" {
		port = defaultPort
	}

	var apiTracer, routerTracer, databaseTracer, maintenanceTracer *sdktrace.TracerProvider
	if enableTracing {
		apiTracer = tracing.InitTracing("api")
		routerTracer = tracing.InitTracing("router")
		databaseTracer = tracing.InitTracing("database")
		maintenanceTracer = tracing.InitTracing("cronjobs")
	} else {
		log.Info("tracing is disabled")
		apiTracer, routerTracer, databaseTracer, maintenanceTracer = nil, nil, nil, nil
	}

	// Initialize database
	db, sqldb, err := database.Init(ctx, databaseTracer)
	defer sqldb.Close()
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}

	if env != "Production" {
		err = database.SeedData(ctx, db)
		if err != nil {
			log.Fatal("seed failed: ", err)
		}
	}
	err = database.InitAdminUser(ctx, db)
	if err != nil {
		log.Fatal("unable to create admin user: ", err)
	}

	resolver = graph.Resolver{
		DB:         db,
		Settings:   make(map[string]string),
		MailConfig: new(email.Config),
	}

	if err := resolver.FetchSettings(ctx); err != nil {
		log.Fatal("unable to get settings: ", err)
	}

	// Set up cronjobs
	c := cron.New()
	c.AddFunc("@hourly", func() {
		var hourlyTracer trace.Tracer
		if enableTracing {
			hourlyTracer = maintenanceTracer.Tracer("hourly")
		} else {
			hourlyTracer = nil
		}

		if err := maintenance.DeleteUnconfirmedPeople(ctx, &resolver, hourlyTracer); err != nil {
			log.Error("error deleting unconfirmed people: ", err)
		}

		if err := maintenance.CleanSessionIds(ctx, &resolver, hourlyTracer); err != nil {
			log.Error("error cleaning session ids: ", err)
		}
	})
	c.Start()
	defer c.Stop()

	log.Info("started cronjobs")

	// Configure router
	router := chi.NewRouter()
	router.Use(
		cors.New(cors.Options{
			AllowedHeaders:   []string{"*"},
			AllowCredentials: true,
			Debug:            false,
		}).Handler,
	)

	if enableTracing {
		router.Use(otelchi.Middleware("pepp-server",
			otelchi.WithChiRoutes(router),
			otelchi.WithTracerProvider(routerTracer),
		))
	}

	router.Use(middleware.Logger)

	frontendUrl, _ := url.Parse("http://localhost:3000")
	router.Handle("/*", httputil.NewSingleHostReverseProxy(frontendUrl))

	router.Get("/confirm/{sessionID}", func(w http.ResponseWriter, r *http.Request) {
		email.Confirm(ctx, w, r, db)
	})

	router.Get("/ical", func(w http.ResponseWriter, r *http.Request) {
		ical.Handler(ctx, w, r, &resolver)
	})

	gc := graph.Config{Resolvers: &resolver}
	if env == "Production" {
		gc.Directives.Auth = directives.Auth
	} else {
		gc.Directives.Auth = func(ctx context.Context, obj interface{}, next graphql.Resolver, rule *model.Rule, role *model.Role) (res interface{}, err error) {
			return next(ctx)
		}
	}

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(gc))
	srv.AddTransport(transport.POST{})

	if enableTracing {
		srv.Use(otelgqlgen.Middleware(otelgqlgen.WithTracerProvider(apiTracer)))
	}

	router.With(func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			sid := r.Header.Get(sessionIdHeader)
			if sid != "" {
				ctx = auth.ValidateUser(ctx, sid, db)
			}
			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}).Handle("/api", srv)

	if env != "Production" {
		router.Handle("/playground", playground.Handler("GraphQL playground", "/api"))
	}

	log.Info("startup finished, server is ready")
	log.Fatal(http.ListenAndServe(":"+port, router))
}
