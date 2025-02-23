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
	Table      hermes.Table
	Outros     []string
}

func Send(person models.User, email Email, config *Config) error {
	h := hermes.Hermes{
		Product: hermes.Product{
			Name:      config.Name,
			Link:      config.HomepageUrl,
			Logo:      config.LogoUrl,
			Copyright: config.CopyrightNotice,
		},
	}

	mail := hermes.Email{
		Body: hermes.Body{
			Name:       person.Fn,
			Greeting:   config.Greeting,
			Signature:  config.Signature,
			Intros:     email.Intros,
			Dictionary: email.Dictionary,
			Actions:    email.Actions,
			Table:      email.Table,
			Outros:     email.Outros,
		},
	}

	from := os.Getenv("FROM_ADDRESS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPW := os.Getenv("SMTP_PASSWORD")
	smtpPort, err := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if err != nil {
		return fmt.Errorf("no valid SMTP_PORT provided: ", err)
	}

	body, err := h.GenerateHTML(mail)
	if err != nil {
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", fmt.Sprintf("%s <%s>", config.Name, from))
	m.SetHeader("To", person.Mail)
	m.SetHeader("Subject", email.Subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPW)
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
