package email

import (
	"context"
	"net/http"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/go-chi/chi/v5"
	"github.com/uptrace/bun"
)

func Confirm(ctx context.Context, w http.ResponseWriter, r *http.Request, db *bun.DB) {
	sessionID := chi.URLParam(r, "sessionID")

	res, err := db.NewUpdate().
		Model(&models.User{}).
		Set("confirmed = true").
		Where("session_id = ?", sessionID).
		Exec(ctx)

	rowsAffected, _ := res.RowsAffected()
	if err != nil || rowsAffected == 0 {
		http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-failed", http.StatusFound)
		return
	}

	http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-success", http.StatusFound)
}
