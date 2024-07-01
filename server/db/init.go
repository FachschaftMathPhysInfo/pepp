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
	"github.com/uptrace/bun/extra/bundebug"
)

func Init(ctx context.Context) (*bun.DB, *sql.DB, error) {
	db_user := os.Getenv("POSTGRES_USER")
	db_pw := os.Getenv("POSTGRES_PASSWORD")
	db_db := os.Getenv("POSTGRES_DB")
	dsn := fmt.Sprintf("postgres://%s:%s@postgres:5432/%s?sslmode=disable",
		db_user,
		db_pw,
		db_db)

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	db := bun.NewDB(sqldb, pgdialect.New())

	db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))

	relations := []interface{}{
		(*models.EventToRoom)(nil),
		(*models.EventToTutor)(nil),
		(*models.TutorToEvent)(nil),
	}

	for _, relation := range relations {
		db.RegisterModel(relation)
	}

	if err := createTables(ctx, db, relations); err != nil {
		return nil, nil, err
	}

	tables := []interface{}{
		(*models.Topic)(nil),
		(*models.Event)(nil),
		(*models.Person)(nil),
		(*models.Building)(nil),
		(*models.Day)(nil),
		(*models.Room)(nil),
	}

	if err := createTables(ctx, db, tables); err != nil {
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
