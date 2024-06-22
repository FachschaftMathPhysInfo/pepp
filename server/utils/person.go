package utils

import (
	"context"
	"fmt"
	"time"
	"os"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/google/uuid"
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

	id := uuid.New()
	createdAt, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
  person := &models.Person{
    ID: id,
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
		SendConfirmationMail(mail, fn, id.String())
	}

	return nil
}
