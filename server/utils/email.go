package utils

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"gopkg.in/gomail.v2"
)

func SendEmail(to string, subject string, body string) error {
	from := os.Getenv("FROM_ADDRESS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPW := os.Getenv("SMTP_PASSWORD")
	smtpPort, err := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPW)
	if err := d.DialAndSend(m); err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}

func ConfirmEmail(ctx context.Context, w http.ResponseWriter, r *http.Request, db *bun.DB) {
  id := chi.URLParam(r, "id")
  userID, err := uuid.Parse(id)
  if err != nil {
    http.Error(w, "Invalid ID", http.StatusBadRequest)
    return
  }

  res, err := db.NewUpdate().
    Model(&models.Tutor{}).
    Set("confirmed = true").
    Where("id = ?", userID).
    Exec(ctx)

  rowsAffected, _ := res.RowsAffected()
  if rowsAffected == 0 {
    http.Error(w, "User not found", http.StatusInternalServerError)
  }
    
  if err != nil {
    http.Error(w, "Failed to update user", http.StatusInternalServerError)
  }

  fmt.Fprintln(w, "Successfully confirmed")
}
