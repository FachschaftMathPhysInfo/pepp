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
			CREATE TABLE IF NOT EXISTS topic_to_events (
				event_id INTEGER NOT NULL,
				topic_id INTEGER NOT NULL,
				PRIMARY KEY (event_id, topic_id)
			)
		`)
		if err != nil {
			return err
		}

		_, err = db.ExecContext(ctx, `
			INSERT INTO topic_to_events (event_id, topic_id)
			SELECT id, topic_id FROM events WHERE topic_id IS NOT NULL
			ON CONFLICT DO NOTHING
		`)
		if err != nil {
			return err
		}

		_, err = db.ExecContext(ctx, `ALTER TABLE events DROP COLUMN topic_id`)
		return err
	}, func(ctx context.Context, db *bun.DB) error {
		fmt.Print(" [down migration] ")
		_, err := db.ExecContext(ctx, `ALTER TABLE events ADD COLUMN topic_id INTEGER`)
		if err != nil {
			return err
		}

		_, err = db.ExecContext(ctx, `
			UPDATE events
			SET topic_id = (
				SELECT tte.topic_id
				FROM topic_to_events tte
				WHERE tte.event_id = events.id
				ORDER BY tte.topic_id LIMIT 1
			)
		`)
		if err != nil {
			return err
		}

		_, err = db.ExecContext(ctx, `DROP TABLE IF EXISTS topic_to_events`)
		return err
	})
}
