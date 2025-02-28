package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/dialect/sqlitedialect"
	"github.com/uptrace/bun/driver/sqliteshim"
	"github.com/uptrace/bun/extra/bunotel"
	"go.opentelemetry.io/otel/sdk/trace"
)

func Init(ctx context.Context, tracer *trace.TracerProvider) (*bun.DB, *sql.DB, error) {
	var db *bun.DB
	var sqldb *sql.DB
	var err error
	switch os.Getenv("DATABASE_TYPE") {
	case "PostgreSQL":
		sqldb, err = connectTCPSocket()
		if err != nil {
			log.Panic("postgres connection failed: ", err)
		}
		db = bun.NewDB(sqldb, pgdialect.New())
	default:
		log.Info("no database type specified, using default sqlite")
		sqldb, err = sql.Open(sqliteshim.ShimName, "./pepp.db")
		if err != nil {
			log.Panic("sqlite creation failed: ", err)
		}
		db = bun.NewDB(sqldb, sqlitedialect.New())
	}

	db.AddQueryHook(bunotel.NewQueryHook(
		bunotel.WithFormattedQueries(true),
		bunotel.WithTracerProvider(tracer),
	))

	relations := []interface{}{
		(*models.ApplicationToQuestion)(nil),
		(*models.EventToUserAssignment)(nil),
		(*models.UserToEventAvailability)(nil),
		(*models.UserToEventRegistration)(nil),
		(*models.RoomToEventAvailability)(nil)}

	tables := []interface{}{
		(*models.Label)(nil),
		(*models.Event)(nil),
		(*models.User)(nil),
		(*models.Building)(nil),
		(*models.Room)(nil),
		(*models.Form)(nil),
		(*models.Question)(nil),
		(*models.Answer)(nil),
		(*models.Application)(nil),
		(*models.Setting)(nil)}

	for _, relation := range relations {
		db.RegisterModel(relation)
	}

	if err := createTables(ctx, db, tables); err != nil {
		log.Panic("unable to insert basic relations in DB: ", err)
	}

	if err := createTables(ctx, db, relations); err != nil {
		log.Panic("unable to insert basic connetcion relations in DB: ", err)
	}

	// if err := seedData(ctx, db); err != nil {
	// 	log.Panic("unable to seed basic data in DB: ", err)
	// }

	return db, sqldb, nil
}

func createTables(ctx context.Context, db *bun.DB, tables []interface{}) error {
	for _, table := range tables {
		if _, err := db.NewCreateTable().
			Model(table).
			IfNotExists().
			Exec(ctx); err != nil {
			return err
		}
	}

	return nil
}

func connectTCPSocket() (*sql.DB, error) {
	mustGetenv := func(k string) string {
		v := os.Getenv(k)
		if v == "" {
			log.Fatalf("Fatal Error in init.go: %s environment variable not set.", k)
		}
		return v
	}

	var (
		dbHost = mustGetenv("POSTGRES_HOST")
		dbUser = mustGetenv("POSTGRES_USER")
		dbPwd  = mustGetenv("POSTGRES_PASSWORD")
		dbName = mustGetenv("POSTGRES_DB")
	)

	dbURI := fmt.Sprintf("host=%s user=%s password=%s database=%s sslmode=verify-full sslrootcert=root.crt sslcert=client.crt sslkey=client.key",
		dbHost, dbUser, dbPwd, dbName)

	dbPool, err := sql.Open("postgres", dbURI)
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %w", err)
	}
	if err = dbPool.Ping(); err != nil {
		log.Fatalf("DB unreachable: %s", err)
	}

	return dbPool, nil
}
