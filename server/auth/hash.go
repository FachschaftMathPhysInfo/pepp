package auth

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func Hash(password string) (hash string, salt string, err error) {
	salt, err = GenerateSalt(16)
	if err != nil {
		return "", "", err
	}
	combined := password + salt + os.Getenv("PEPPER_KEY")

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(combined), bcrypt.DefaultCost)
	if err != nil {
		return "", "", fmt.Errorf("error hashing password: %s", err)
	}

	return string(hashedPassword), salt, nil
}
