package auth

import (
	"context"
	"fmt"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
)

func GenerateSessionID() (string, error) {
	return GenerateSalt(11)
}

func ValidateUser(ctx context.Context, sid string, db *bun.DB) (context.Context, error) {
	user := new(models.User)
	err := db.NewSelect().
		Model(user).Where("session_id = ?", sid).
		Scan(ctx)

	if err != nil {
		return nil, err
	} else if user == nil {
		return nil, fmt.Errorf("invalid session id")
	}

	return context.WithValue(ctx, "user", user), nil
}
