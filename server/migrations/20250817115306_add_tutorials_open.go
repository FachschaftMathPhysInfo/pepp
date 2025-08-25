package migrations

import (
	"context"
	"fmt"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		log.Info(" [up migration] ")

		var q *bun.AddColumnQuery
		if db.Dialect().Name() == dialect.SQLite {
			// SQLite: INTEGER used for booleans (0 = false)
			q = db.NewAddColumn().
				Model((*models.Event)(nil)).
				ColumnExpr("tutorials_open INTEGER NOT NULL DEFAULT 0")
			// SQLite does not support "IF NOT EXISTS" with ADD COLUMN
		} else {
			q = db.NewAddColumn().
				Model((*models.Event)(nil)).
				ColumnExpr("tutorials_open boolean NOT NULL DEFAULT false").
				IfNotExists()
		}

		if _, err := q.Exec(ctx); err != nil {
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
