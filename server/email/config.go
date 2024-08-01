package email

import "github.com/matcornic/hermes/v2"

type Config struct {
	LogoUrl         string
	HomepageUrl     string
	CopyrightNotice string
	Greeting        string
	Signature       string
	Name            string

	Confirmation Email
	Assignment   Email
}

func (c *Config) ApplySettings(s map[string]string) {
	c.LogoUrl = s["logo-url"]
	c.HomepageUrl = s["homepage-url"]
	c.CopyrightNotice = s["copyright-notice"]
	c.Greeting = s["email-greeting"]
	c.Signature = s["email-signature"]
	c.Name = s["email-name"]

	c.Confirmation.Subject = s["email-confirm-subject"]
	c.Confirmation.Intros = []string{s["email-confirm-intro"]}
	c.Confirmation.Outros = []string{s["email-confirm-outro"]}
	c.Confirmation.Actions = []hermes.Action{{
		Instructions: s["email-confirm-button-instruction"],
		Button: hermes.Button{
			Color: s["primary-color"],
			Text:  s["email-confirm-button-text"],
		},
	}}
	c.Confirmation.Table = hermes.Table{
		Columns: hermes.Columns{
			CustomWidth: map[string]string{
				s["email-assignment-date-title"]: "20%",
				s["email-assignment-kind-title"]: "30%",
			},
		},
	}

	c.Assignment.Intros = []string{s["email-assignment-intro"]}
	c.Assignment.Outros = []string{s["email-assignment-outro"]}
}