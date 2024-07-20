package email

import (
	"fmt"
	"os"
	"strconv"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/matcornic/hermes/v2"
	"gopkg.in/gomail.v2"
)

type Email struct {
	Subject    string
	Intros     []string
	Dictionary []hermes.Entry
	Actions    []hermes.Action
	Outros     []string
}

func Send(person models.User, email Email) error {
	h := hermes.Hermes{
		Product: hermes.Product{
			Name:      os.Getenv("EMAIL_NAME"),
			Link:      os.Getenv("HOMEPAGE_URL"),
			Logo:      os.Getenv("LOGO_URL"),
			Copyright: os.Getenv("COPYRIGHT"),
		},
	}

	mail := hermes.Email{
		Body: hermes.Body{
			Name:       person.Fn,
			Greeting:   os.Getenv("EMAIL_GREETING"),
			Signature:  os.Getenv("EMAIL_SIGNATURE"),
			Intros:     email.Intros,
			Dictionary: email.Dictionary,
			Actions:    email.Actions,
			Outros:     email.Outros,
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

	body, err := h.GenerateHTML(mail)
	if err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", fmt.Sprintf("%s <%s>", os.Getenv("EMAIL_NAME"), from))
	m.SetHeader("To", person.Mail)
	m.SetHeader("Subject", email.Subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPW)
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
