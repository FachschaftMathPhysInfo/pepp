package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/FachschaftMathPhysInfo/pepp/server/db"
	"github.com/FachschaftMathPhysInfo/pepp/server/email"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph"
	"github.com/FachschaftMathPhysInfo/pepp/server/maintenance"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/robfig/cron/v3"
	"github.com/rs/cors"
	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

const (
	defaultPort  = "8080"
	apiKeyHeader = "X-API-Key"
	name         = "pepp-server"
)

var (
	tracer = otel.Tracer(name)
	meter  = otel.Meter(name)
	logger = otelslog.NewLogger(name)
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// init opentelemetry instrumentation
	shutdown := initTracer()
	defer shutdown()

	tracer := otel.Tracer("pepp-server")
	ctx, span := tracer.Start(context.Background(), "main")
	defer span.End()

	// init of database (create tables and stuff)
	db, sqldb, err := db.Init(ctx)
	defer sqldb.Close()
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}

	// cronjobs for maintenance tasks
	c := cron.New()
	c.AddFunc("@hourly", func() {
		ctx, span := tracer.Start(ctx, "users-cronjob-hourly")
		defer span.End()

		if err := maintenance.DeleteUnconfirmedPeople(ctx, db); err != nil {
			log.Println("Error deleting unconfirmed people:", err)
		}

		if err := maintenance.CleanSessionIds(ctx, db); err != nil {
			log.Println("Error cleaning session ids:", err)
		}
	})
	c.Start()
	defer c.Stop()

	// server configuration
	// [/]: Next.JS frontend
	// [/api]: JSON API endpoint
	// [/playground]: GraphQL Playground
	// [/confirm/{sessionID}]: Confirm email addresses
	router := chi.NewRouter()
	router.Use(cors.New(cors.Options{
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            false,
	}).Handler)

	router.Use(middleware.Logger)

	frontendUrl, _ := url.Parse("http://frontend:3000")
	proxy := httputil.NewSingleHostReverseProxy(frontendUrl)
	router.Handle("/*", otelhttp.NewHandler(proxy, "frontend-proxy"))

	router.MethodFunc(http.MethodGet, "/confirm/{sessionID}", otelhttp.NewHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		email.Confirm(ctx, w, r, db)
	}), "confirm-email").ServeHTTP)

	gqlResolvers := graph.Resolver{DB: db}
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &gqlResolvers}))
	router.With(func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Header.Get(apiKeyHeader) != os.Getenv("API_KEY") {
				http.Error(w, "Invalid API Key", http.StatusUnauthorized)
				return
			}
			h.ServeHTTP(w, r)
		})
	}).Handle("/api", otelhttp.NewHandler(srv, "graphql-api"))

	router.Handle("/playground", playground.Handler("GraphQL playground", "/api"))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func initTracer() func() {
	headers := map[string]string{
		"content-type": "application/json",
	}

	exporter, err := otlptrace.New(
		context.Background(),
		otlptracehttp.NewClient(
			otlptracehttp.WithEndpoint("otel-collector:4318"),
			otlptracehttp.WithHeaders(headers),
			otlptracehttp.WithInsecure(),
		),
	)
	if err != nil {
		log.Fatalf("failed to initialize stdouttrace exporter %v", err)
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(
			exporter,
			sdktrace.WithMaxExportBatchSize(sdktrace.DefaultMaxExportBatchSize),
			sdktrace.WithBatchTimeout(sdktrace.DefaultScheduleDelay*time.Millisecond),
			sdktrace.WithMaxExportBatchSize(sdktrace.DefaultMaxExportBatchSize),
		),
	)

	otel.SetTracerProvider(tp)

	return func() {
		_ = tp.Shutdown(context.Background())
	}
}
