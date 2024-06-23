package utils

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
)

func AddPerson(ctx context.Context, fn string, sn string, mail string, t models.PersonType, db *bun.DB) error {
  var persons []*models.Person
  db.NewSelect().
	  Model(&persons).
		Where("mail = ?", mail).
		Scan(ctx)

  if len(persons) != 0 {
    return fmt.Errorf("Person with E-Mail %s already exists", mail)
	}

	createdAt, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
  person := &models.Person{
    Fn: fn,
		Sn: sn,
		Mail: mail,
		Confirmed: false,
		Type: t,
		CreatedAt: createdAt,
  }

	_, err := db.NewInsert().Model(person).Exec(ctx)
	if err != nil {
    return err
	}

	if os.Getenv("SMTP_HOST") == "" {
		fmt.Printf("Email Server not configured. Skipping verification for %s", mail)
	} else {
		SendConfirmationMail(mail, fn)
	}

	return nil
}

func GetPerson(ctx context.Context, mail string, db *bun.DB) (*models.Person, error) {
  person := new(models.Person) 
  err := db.NewSelect().
    Model(person).
    Where("mail = ?", mail).
    Scan(ctx)

  if err != nil {
    return nil, err
  }
  return person, nil
}
