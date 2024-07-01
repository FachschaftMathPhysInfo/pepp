package email

import (
	"context"
	"fmt"
	"net/http"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/go-chi/chi/v5"
	"github.com/uptrace/bun"
)

func Confirm(ctx context.Context, w http.ResponseWriter, r *http.Request, db *bun.DB) {
	sessionID := chi.URLParam(r, "sessionID")

	res, err := db.NewUpdate().
		Model(&models.Person{}).
		Set("confirmed = true").
		Where("session_id = ?", sessionID).
		Exec(ctx)

	rowsAffected, _ := res.RowsAffected()
	if err != nil || rowsAffected == 0 {
		http.Error(w, "Invalid URL", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	fmt.Fprint(w, "Successfully confirmed")
}
