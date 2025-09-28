package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/auth"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/dialect/sqlitedialect"
	"github.com/uptrace/bun/extra/bundebug"
	"github.com/uptrace/bun/extra/bunotel"
	"go.opentelemetry.io/otel/sdk/trace"
	_ "modernc.org/sqlite"
)

const (
	maxRetries    = 5
	retryInterval = 2 * time.Second
)

var (
	db        *bun.DB
	sqldb     *sql.DB
	err       error
	relations = []interface{}{
		(*models.ApplicationToQuestion)(nil),
		(*models.TutorialToUserAssignment)(nil),
		(*models.EventToSupportingEvent)(nil),
		(*models.UserToEventAvailability)(nil),
		(*models.UserToTutorialRegistration)(nil),
		(*models.TopicToEvent)(nil)}

	tables = []interface{}{
		(*models.Label)(nil),
		(*models.Event)(nil),
		(*models.User)(nil),
		(*models.Building)(nil),
		(*models.Room)(nil),
		(*models.Form)(nil),
		(*models.Question)(nil),
		(*models.Answer)(nil),
		(*models.Application)(nil),
		(*models.Tutorial)(nil),
		(*models.Setting)(nil),
		(*models.ConfirmationToken)(nil)}
)

func Init(ctx context.Context, tracer *trace.TracerProvider) (*bun.DB, *sql.DB, error) {
	if os.Getenv("POSTGRES_HOST") != "" {
		log.Info("connecting to postgres instance...")
		sqldb, err = connectTCPSocket()
		if err != nil {
			log.Panic("postgres connection failed: ", err)
		}
		db = bun.NewDB(sqldb, pgdialect.New())
	} else {
		log.Info("no db host specified: connecting to default sqlite...")
		sqldb, err = sql.Open("sqlite", "file:pepp.db?_pragma=foreign_keys(1)")
		if err != nil {
			log.Panic("sqlite creation failed: ", err)
		}
		db = bun.NewDB(sqldb, sqlitedialect.New())
	}

	if os.Getenv("LOG_LEVEL") == "Debug" {
		db.AddQueryHook(bundebug.NewQueryHook(
			bundebug.WithVerbose(true),
		))
	}

	if tracer != nil {
		db.AddQueryHook(bunotel.NewQueryHook(
			bunotel.WithFormattedQueries(true),
			bunotel.WithTracerProvider(tracer),
		))
	}

	for _, relation := range relations {
		db.RegisterModel(relation)
	}

	if err := createTables(ctx, tables); err != nil {
		log.Panic("unable to insert basic relations in DB: ", err)
	}

	if err := createTables(ctx, relations); err != nil {
		log.Panic("unable to insert basic connetcion relations in DB: ", err)
	}

	return db, sqldb, nil
}

func InitAdminUser(ctx context.Context, db *bun.DB) error {
	mail := os.Getenv("ADMIN_USER")
	if mail == "" {
		mail = "admin@pepp.local"
	}

	password := "admin"
	if os.Getenv("ENV") == "Production" {
		password, err = utils.RandString(24)
		if err != nil {
			return err
		}
	}

	hash, err := auth.Hash(password)
	if err != nil {
		return err
	}

	admin := &models.User{
		Fn:        "Admin",
		Sn:        "",
		Mail:      mail,
		Password:  hash,
		Confirmed: utils.BoolPtr(true),
		Role:      "ADMIN",
	}
	res, err := db.NewInsert().Model(admin).Ignore().Exec(ctx)
	if err != nil {
		return err
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 1 {
		log.Infof("new admin user created:\n  mail:     %s\n  password: %s",
			mail, password)
	}

	return nil
}

func createTables(ctx context.Context, tables []interface{}) error {
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
		dbURI  string
	)

	if _, err := os.Stat("client.crt"); err == nil {
		dbURI = fmt.Sprintf("host=%s user=%s password=%s database=%s sslmode=verify-full sslrootcert=root.crt sslcert=client.crt sslkey=client.key",
			dbHost, dbUser, dbPwd, dbName)
	} else {

		dbURI = fmt.Sprintf("host=%s user=%s password=%s database=%s",
			dbHost, dbUser, dbPwd, dbName)
	}

	dbPool, err := sql.Open("postgres", dbURI)
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %w", err)
	}

	var pingErr error
	for i := 1; i <= maxRetries; i++ {
		pingErr = dbPool.Ping()
		if pingErr == nil {
			return dbPool, nil
		}
		log.Warnf("postgres ping failed (attempt %d/%d): %v", i, maxRetries, pingErr)
		time.Sleep(retryInterval)
	}

	return nil, fmt.Errorf("could not connect to postgres after %d attempts: %w", maxRetries, pingErr)
}
