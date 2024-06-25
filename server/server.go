package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/robfig/cron/v3"
	"github.com/rs/cors"
)

const defaultPort = "8080"

func main() {
	ctx := context.Background()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// secret key needed to encrypt strings
	secretKey, err := utils.GenSecretKey()
	if err != nil {
		log.Fatal("Failed to generate secret key")
	}
	os.Setenv("SECRET_KEY", secretKey)

	// init of database (create tables and stuff)
	db, sqldb, err := utils.InitDB(ctx)
	defer sqldb.Close()
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}

	// cronjobs for maintenance tasks
	c := cron.New()
	c.AddFunc("@hourly", func() {
		err := utils.DeleteUnconfirmedPeople(ctx, db)
		if err != nil {
			log.Println("Error deleting unconfirmed people:", err)
		}
	})
	c.Start()
	defer c.Stop()

	// server configuration
	// [/]: GraphQL Playground
	// [/api]: JSON API endpoint
	// [/confirm/{email}]: Confirm email addresses
	router := chi.NewRouter()
	router.Use(cors.New(cors.Options{
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            false,
	}).Handler)

	router.Use(middleware.Logger)

	router.Get("/confirm/{mail}", func(w http.ResponseWriter, r *http.Request) {
		utils.ConfirmEmail(ctx, w, r, db)
	})

	gqlResolvers := graph.Resolver{DB: db}
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &gqlResolvers}))
	router.Handle("/api", srv)

	router.Handle("/", playground.Handler("GraphQL playground", "/api"))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}