package email

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/go-chi/chi/v5"
	"github.com/uptrace/bun"
)

func Confirm(ctx context.Context, w http.ResponseWriter, r *http.Request, db *bun.DB) {
	mailHash := chi.URLParam(r, "mailHash")

	var allUsers []*models.User
	var requestingUser *models.User

	err := db.NewSelect().
		Model(&allUsers).
		Scan(ctx)

	if err != nil || allUsers == nil {
		http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-failed", http.StatusFound)
		return
	}

	for _, user := range allUsers {
		hashBytes := sha256.Sum256([]byte(user.Mail))
		hashHex := hex.EncodeToString(hashBytes[:])

		if hashHex == mailHash {
			requestingUser = user
			break
		}
	}

	if requestingUser == nil {
		http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-failed", http.StatusFound)
		return
	}

	confirm := true
	requestingUser.Confirmed = &confirm

	if _, err = db.NewUpdate().Model(requestingUser).WherePK().Exec(ctx); err != nil {
		http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-failed", http.StatusFound)
		return
	}

	http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-success", http.StatusFound)
}
