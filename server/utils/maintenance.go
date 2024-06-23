package utils

import (
	"context"
	"fmt"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
)

func DeleteUnconfirmedPeople(ctx context.Context, db *bun.DB) error {
	twoHoursAgo := time.Now().Add(-2 * time.Hour)

	res, err := db.NewDelete().
		Model((*models.Person)(nil)).
		Where("confirmed = ?", false).
		Where("created_at <= ?", twoHoursAgo).
		Exec(ctx)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	fmt.Printf("Deleted %d unconfirmed people\n", rowsAffected)
	return nil
}
