package migrations

import (
	"context"
	"fmt"

	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [up migration] add capacity column ")

		_, err := db.ExecContext(ctx, `
			ALTER TABLE tutorials
			ADD COLUMN capacity SMALLINT NOT NULL DEFAULT 0
		`)

		return err
	}, func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [down migration] drop capacity column ")

		_, err := db.ExecContext(ctx, `
			ALTER TABLE tutorials
			DROP COLUMN capacity
		`)
		return err
	})
}
