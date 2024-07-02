package email

import (
	"fmt"
	"os"
	"strconv"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/matcornic/hermes/v2"
	"gopkg.in/gomail.v2"
)

// Make nicer when needed
func SendConfirmation(person models.User) error {
	h := hermes.Hermes{
		Product: hermes.Product{
			Name:      "Pepp - Die Vorkursverwaltung",
			Link:      "https://mathphys.info/",
			Logo:      "https://mathphys.info/mathphysinfo-logo.png",
			Copyright: "Copyright © 2024, Fachschaft MathPhysInfo. All rights reserved.",
		},
	}

	email := hermes.Email{
		Body: hermes.Body{
			Name:      person.Fn,
			Greeting:  "Hey",
			Signature: "Dein",
			Intros: []string{
				"danke für deine Registrierung als Vorkurstutor/-in!",
			},
			Actions: []hermes.Action{
				{
					Instructions: "Bitte klicke hier um deine E-Mail Adresse zu bestätigen:",
					Button: hermes.Button{
						Color: "#990000",
						Text:  "E-Mail bestätigen",
						Link: fmt.Sprintf("%s/confirm/%s",
							os.Getenv("API_URL"), person.SessionID),
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
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", fmt.Sprintf("Pepp - Die Vorkursverwaltung <%s>", from))
	m.SetHeader("To", person.Mail)
	m.SetHeader("Subject", "Bitte bestätige deine E-Mail Adresse")
	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPW)
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
