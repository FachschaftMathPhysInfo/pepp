package maintenance

import (
	"context"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/graph"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"go.opentelemetry.io/otel/trace"
)

func DeleteUnconfirmedPeople(ctx context.Context, r *graph.Resolver, tracer trace.Tracer) error {
	ctx, span := tracer.Start(ctx, "delete-unconfirmed-people")
	defer span.End()

	twoHoursAgo := time.Now().Add(-2 * time.Hour)

	var mails []string
	if _, err := r.DB.NewSelect().
		Model((*models.User)(nil)).
		Column("mail").
		Where("confirmed = ?", false).
		Where("created_at <= ?", twoHoursAgo).
		Exec(ctx, &mails); err != nil {
		return err
	}

	if _, err := r.Mutation().DeleteUser(ctx, mails); err != nil {
		return err
	}

	return nil
}

func CleanSessionIds(ctx context.Context, r *graph.Resolver, tracer trace.Tracer) error {
	ctx, span := tracer.Start(ctx, "clean-session-ids")
	defer span.End()

	twelveHoursAgo := time.Now().Add(-12 * time.Hour)

	if _, err := r.DB.NewUpdate().
		Model((*models.User)(nil)).
		Set("session_id = null").
		Where("last_login <= ?", twelveHoursAgo).
		Exec(ctx); err != nil {
		return err
	}

	return nil
}
