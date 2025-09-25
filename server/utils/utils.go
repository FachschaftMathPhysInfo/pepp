package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"time"

	log "github.com/sirupsen/logrus"
)

func RandomURLSafeString(nBytes int) (string, error) {
	if nBytes <= 0 {
		return "", fmt.Errorf("nBytes must be > 0")
	}
	b := make([]byte, nBytes)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func RandString(entropy int) (string, error) {
	b := make([]byte, entropy)
	_, err := rand.Read(b)
	if err != nil {
		return "", fmt.Errorf("error generating random string:", err)
	}
	return base64.RawStdEncoding.EncodeToString(b), nil
}

func MustGetEnv(key string) string {
	s := os.Getenv(key)
	if s == "" {
		log.Fatal("required env var not available:", key)
	}

	return s
}

func SetCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	c := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(time.Hour.Seconds()) * 24,
		Secure:   r.TLS != nil,
		HttpOnly: true,
	}
	http.SetCookie(w, c)
}

func BoolPtr(b bool) *bool { return &b }
