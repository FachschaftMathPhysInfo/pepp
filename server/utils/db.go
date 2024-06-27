package utils

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func InitDB(ctx context.Context) (*bun.DB, *sql.DB, error) {
	db_user := os.Getenv("POSTGRES_USER")
	db_pw := os.Getenv("POSTGRES_PASSWORD")
	db_db := os.Getenv("POSTGRES_DB")
	dsn := fmt.Sprintf("postgres://%s:%s@postgres:5432/%s?sslmode=disable",
		db_user,
		db_pw,
		db_db)

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	db := bun.NewDB(sqldb, pgdialect.New())

	if err := createSchema(ctx, db, (*models.Event)(nil)); err != nil {
		return nil, nil, err
	}

	if err := createSchema(ctx, db, (*models.Person)(nil)); err != nil {
		return nil, nil, err
	}

	if err := createSchema(ctx, db, (*models.Building)(nil)); err != nil {
		return nil, nil, err
	}

	return db, sqldb, nil
}

func createSchema(ctx context.Context, db *bun.DB, model interface{}) error {
	_, err := db.NewCreateTable().
		Model(model).
		IfNotExists().
		Exec(ctx)
	return err
}
