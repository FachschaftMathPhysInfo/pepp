package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

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
)

const (
	defaultPort  = "8080"
	apiKeyHeader = "X-API-Key"
)

func main() {
	ctx := context.Background()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

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
	router.Handle("/*", proxy)

	router.Get("/confirm/{sessionID}", func(w http.ResponseWriter, r *http.Request) {
		email.Confirm(ctx, w, r, db)
	})

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
	}).Handle("/api", srv)

	router.Handle("/playground", playground.Handler("GraphQL playground", "/api"))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
