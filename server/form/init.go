package form

import (
	"crypto/rand"
	"encoding/base64"
	"log"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func Init() *oauth2.Config {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		log.Fatalf("failed to generate state string: %v", err)
	}

	os.Setenv("OAUTH_STATE_STRING", base64.RawStdEncoding.EncodeToString(b))

	return &oauth2.Config{
		RedirectURL:  os.Getenv("PUBLIC_URL") + "/oauth2/callback",
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Scopes: []string{
			"https://www.googleapis.com/auth/forms.responses.readonly",
		},
		Endpoint: google.Endpoint,
	}
}
