package migrations

import (
	"context"
	"fmt"

	"github.com/uptrace/bun"
)

func init() {
	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [up migration] ")

		_, err := db.ExecContext(ctx, `
			ALTER TABLE tutorials
			ADD COLUMN description TEXT
		`)
		return err
	}, func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [down migration] ")

		_, err := db.ExecContext(ctx, `
			ALTER TABLE tutorials
			DROP COLUMN description
		`)
		return err
	})
}
