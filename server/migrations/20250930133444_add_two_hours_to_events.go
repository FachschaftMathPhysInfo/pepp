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
				UPDATE events
				SET "from" = "from" + INTERVAL '2 hours',
				    "to"   = "to"   + INTERVAL '2 hours'
			`)

		return err
	}, func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [down migration] ")
		_, err := db.ExecContext(ctx, `
				UPDATE events
				SET "from" = "from" - INTERVAL '2 hours',
				    "to"   = "to"   - INTERVAL '2 hours'
			`)
		return err
	})
}
