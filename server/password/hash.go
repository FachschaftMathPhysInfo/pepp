package password

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func Hash(password, salt string) (string, error) {
	combined := password + salt + os.Getenv("PEPPER_KEY")

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(combined), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("error hashing password: %s", err)
	}

	return string(hashedPassword), nil
}
