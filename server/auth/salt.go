package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

func GenerateSalt(entropy int) (string, error) {
	salt := make([]byte, entropy)
	_, err := rand.Read(salt)
	if err != nil {
		return "", fmt.Errorf("error generating salt: %s", err)
	}
	return base64.RawStdEncoding.EncodeToString(salt), nil
}
