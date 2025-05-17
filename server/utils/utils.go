package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"

	log "github.com/sirupsen/logrus"
)

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
