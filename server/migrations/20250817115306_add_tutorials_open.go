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
			ColumnExpr("tutorials_open boolean NOT NULL DEFAULT false").
			IfNotExists().
			Exec(ctx); err != nil {
			return fmt.Errorf("add tutorials_open column: %w", err)
		}

		return nil
	}, func(ctx context.Context, db *bun.DB) error {
		log.Info(" [down migration] ")

		if _, err := db.NewDropColumn().
			Model((*models.Event)(nil)).
			Column("tutorials_open").
			Exec(ctx); err != nil {
			return fmt.Errorf("drop tutorials_open column: %w", err)
		}

		return nil
	})
}
