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
	"github.com/matcornic/hermes/v2"
	"github.com/uptrace/bun"
	"gopkg.in/gomail.v2"
)

// Make nicer when needed
func SendConfirmationMail(mail string, fn string, id string) error {
  h := hermes.Hermes{
    Product: hermes.Product{
        Name: "Pepp - Die Vorkursverwaltung",
        Link: "https://mathphys.info/",
        Logo: "https://mathphys.info/mathphysinfo-logo.png",
				Copyright: "Copyright © 2024, Fachschaft MathPhysInfo. All rights reserved.",
    },
  }
	email := hermes.Email{
    Body: hermes.Body{
      Name: fn,
			Greeting: "Hey",
			Signature: "Dein",
			Intros: []string{
				"danke für deine Registrierung als Vorkurstutor/-in!",
			},
			Actions: []hermes.Action{
				{
				  Instructions: "Bitte klicke hier um deine E-Mail Adresse zu bestätigen:",
					Button: hermes.Button{
				    Color: "#990000",
						Text: "E-Mail bestätigen",
						Link: fmt.Sprintf("%s/confirm/%s",
		          os.Getenv("API_URL"), id),
					},
				},
			},
			Outros: []string{
				"Danke! Wir melden uns bei dir.",
			},
		},
	}
	from := os.Getenv("FROM_ADDRESS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPW := os.Getenv("SMTP_PASSWORD")
	smtpPort, err := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if err != nil {
		return err
	}

	body, err := h.GenerateHTML(email)
	if err != nil {
    return fmt.Errorf("EMAIL_GENERATION_FAILED")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", fmt.Sprintf("Pepp - Die Vorkursverwaltung <%s>", from))
	m.SetHeader("To", mail)
	m.SetHeader("Subject", "Bitte bestätige deine E-Mail Adresse")
	m.SetBody("text/html", body)

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
    Model(&models.Person{}).
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
