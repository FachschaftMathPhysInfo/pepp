package email

import (
	"context"
	"github.com/FachschaftMathPhysInfo/pepp/server/auth"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/go-chi/chi/v5"
	"github.com/uptrace/bun"
)

func Confirm(ctx context.Context, w http.ResponseWriter, r *http.Request, db *bun.DB) {
	mailHash := chi.URLParam(r, "mailHash")
	log.Printf("given mailHash: %s", mailHash)

	var allUsers []*models.User
	var requestingUser *models.User

	err := db.NewSelect().
		Model(&allUsers).
		// Puts the newest users first, reducing hashing attempts
		OrderExpr("created_at DESC").
		Scan(ctx)

	if err != nil || allUsers == nil {
		http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-failed", http.StatusFound)
		return
	}

	for _, user := range allUsers {
		log.Print("hashsing: ", user.Mail)
		if auth.VerifyHash(mailHash, user.Mail) == nil {
			log.Print("found user: ", user.Mail)
			requestingUser = user
			break
		}
		log.Print("miss")
	}

	now := time.Now()
	twelveHoursAgo := now.Add(-12 * time.Hour)

	if requestingUser == nil || requestingUser.CreatedAt.Before(twelveHoursAgo) {
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
