package maintenance

import (
	"context"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
)

func DeleteUnconfirmedPeople(ctx context.Context, db *bun.DB) error {
	twoHoursAgo := time.Now().Add(-2 * time.Hour)

	if _, err := db.NewDelete().
		Model((*models.User)(nil)).
		Where("confirmed = ?", false).
		Where("created_at <= ?", twoHoursAgo).
		Exec(ctx); err != nil {
		return err
	}

	return nil
}

func CleanSessionIds(ctx context.Context, db *bun.DB) error {
	twelveHoursAgo := time.Now().Add(-12 * time.Hour)

	if _, err := db.NewUpdate().
		Model(&models.User{}).
		Set("session_id = null").
		Where("last_login <= ?", twelveHoursAgo).
		Exec(ctx); err != nil {
		return err
	}

	return nil
}
