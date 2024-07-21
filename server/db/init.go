package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	"github.com/uptrace/bun/extra/bunotel"
	"go.opentelemetry.io/otel/sdk/trace"
)

func Init(ctx context.Context, tracer *trace.TracerProvider) (*bun.DB, *sql.DB, error) {
	db_user := os.Getenv("POSTGRES_USER")
	db_pw := os.Getenv("POSTGRES_PASSWORD")
	db_db := os.Getenv("POSTGRES_DB")
	dsn := fmt.Sprintf("postgres://%s:%s@postgres:5432/%s?sslmode=disable",
		db_user,
		db_pw,
		db_db)

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	db := bun.NewDB(sqldb, pgdialect.New())

	db.AddQueryHook(bunotel.NewQueryHook(
		bunotel.WithFormattedQueries(true),
		bunotel.WithTracerProvider(tracer),
	))

	relations := []interface{}{
		(*models.EventToTutor)(nil),
		(*models.TutorToEvent)(nil),
		(*models.StudentToEvent)(nil),
		(*models.RoomToEvent)(nil)}

	tables := []interface{}{
		(*models.Label)(nil),
		(*models.Event)(nil),
		(*models.User)(nil),
		(*models.Building)(nil),
		(*models.Room)(nil),
		(*models.Answer)(nil)}

	for _, relation := range relations {
		db.RegisterModel(relation)
	}

	if err := createTables(ctx, db, tables); err != nil {
		return nil, nil, err
	}

	if err := createTables(ctx, db, relations); err != nil {
		return nil, nil, err
	}

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
