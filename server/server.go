package main

import (
	"context"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/FachschaftMathPhysInfo/pepp/server/db"
	"github.com/FachschaftMathPhysInfo/pepp/server/email"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph"
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
	defaultPort  = "8080"
	apiKeyHeader = "X-API-Key"
)

var resolver graph.Resolver

func main() {
	ctx := context.Background()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	enableTracing := os.Getenv("ENABLE_TRACING") == "true"

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
	db, sqldb, err := db.Init(ctx, databaseTracer)
	defer sqldb.Close()
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}

	resolver = graph.Resolver{
		DB:         db,
		Settings:   make(map[string]string),
		MailConfig: new(email.Config),
	}

	if err := resolver.FetchSettings(ctx); err != nil {
		log.Fatal("unable to get settings: ", err)
	}

	log.Info("database connection successful")

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

	frontendUrl, _ := url.Parse("http://frontend:3000")
	router.Handle("/*", httputil.NewSingleHostReverseProxy(frontendUrl))

	router.Get("/confirm/{sessionID}", func(w http.ResponseWriter, r *http.Request) {
		email.Confirm(ctx, w, r, db)
	})

	router.Get("/ical", func(w http.ResponseWriter, r *http.Request) {
		ical.Handler(ctx, w, r, &resolver)
	})

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &resolver}))

	if enableTracing {
		srv.Use(otelgqlgen.Middleware(otelgqlgen.WithTracerProvider(apiTracer)))
	}

	router.With(func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Header.Get(apiKeyHeader) != os.Getenv("API_KEY") {
				http.Error(w, "Invalid API Key", http.StatusUnauthorized)
				return
			}
			h.ServeHTTP(w, r)
		})
	}).Handle("/api", srv)

	router.Handle("/playground", playground.Handler("GraphQL playground", "/api"))

	log.Info("router setup finished, ready to fire")
	log.Fatal(http.ListenAndServe(":"+port, router))
}
