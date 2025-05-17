package auth

import (
	"context"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/uptrace/bun"
)

func GenerateSessionID() (string, error) {
	return utils.RandString(11)
}

func ValidateUser(ctx context.Context, sid string, db *bun.DB) context.Context {
	user := new(models.User)
	err := db.NewSelect().
		Model(user).Where("session_id = ?", sid).
		Scan(ctx)

	if err != nil || user == nil {
		return ctx
	}

	return context.WithValue(ctx, "user", user)
}
