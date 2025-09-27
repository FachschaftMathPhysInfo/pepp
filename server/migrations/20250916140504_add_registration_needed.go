package migrations

import (
	"context"
	"fmt"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		log.Info(" [up migration] ")

		if _, err := db.NewAddColumn().
			Model((*models.Event)(nil)).
			ColumnExpr("registration_needed boolean NOT NULL DEFAULT true").
			IfNotExists().
			Exec(ctx); err != nil {
			return fmt.Errorf("add registration_needed column: %w", err)
		}

		return nil
	}, func(ctx context.Context, db *bun.DB) error {
		log.Info(" [down migration] ")

		if _, err := db.NewDropColumn().
			Model((*models.Event)(nil)).
			Column("registration_needed").
			Exec(ctx); err != nil {
			return fmt.Errorf("drop registration_needed column: %w", err)
		}

		return nil
	})
}
