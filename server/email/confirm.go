package email

import (
	"context"
	"net/http"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/go-chi/chi/v5"
	"github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func Confirm(ctx context.Context, w http.ResponseWriter, r *http.Request, db *bun.DB) {
	token := chi.URLParam(r, "token")

	confirmToken := new(models.ConfirmationToken)
	db.NewSelect().
		Model(confirmToken).
		Where("token = ?", token).
		Scan(ctx)

	if confirmToken == nil || confirmToken.ExpiresAt.Before(time.Now()) {
		http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-failed", http.StatusFound)
		return
	}

	updatedUser := &models.User{ID: confirmToken.UserID, Confirmed: utils.BoolPtr(true)}
	if _, err := db.NewUpdate().
		Model(updatedUser).
		Column("confirmed").
		WherePK().
		Exec(ctx); err != nil {
		http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-failed", http.StatusFound)
		return
	}

	http.Redirect(w, r, utils.MustGetEnv("PUBLIC_URL")+"/confirm-success", http.StatusFound)

	if _, err := db.NewDelete().
		Model(confirmToken).
		WherePK().
		Exec(ctx); err != nil {
		logrus.Error("unable to delete token after confirmation: %s", confirmToken.Token)
	}

}
