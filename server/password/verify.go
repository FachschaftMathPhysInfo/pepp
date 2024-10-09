package password

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func VerifyPassword(hashedPassword, password, salt string) error {
	passwordWithPepper := password + salt + os.Getenv("PEPPER_KEY")

	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(passwordWithPepper))
	if err != nil {
		return fmt.Errorf("invalid password: %s", err)
	}
	return nil
}
