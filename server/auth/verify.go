package auth

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
	"golang.org/x/crypto/bcrypt"
)

func VerifyPassword(hashedPassword, password, salt string) error {
	passwordWithPepper := password + salt + os.Getenv("PEPPER_KEY")

	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(passwordWithPepper))
	if err != nil {
		return fmt.Errorf("invalid password: %s", err)
	}
	return nil
}

func verifySsoUser(ctx context.Context, db *bun.DB, user models.User) (string, error) {
	sid, err := GenerateSessionID()
	if err != nil {
		return "", fmt.Errorf("error while generating session id for sso user:", err)
	}

	if _, err := db.NewInsert().
		Model(&user).
		On("CONFLICT (mail) DO UPDATE").
		Set("session_id = ?", sid).
		Set("last_login = ?", time.Now()).
		Exec(ctx); err != nil {
		return "", err
	}

	return sid, nil
}
