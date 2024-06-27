package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"context"
	"fmt"
	"os"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/uptrace/bun"
)

type Resolver struct {
	DB *bun.DB
}

func (r *mutationResolver) AddPerson(ctx context.Context, person models.Person) error {
	count, err := r.DB.NewSelect().
		Model((*models.Person)(nil)).
		Where("mail = ?", person.Mail).
		Count(ctx)

	if err != nil {
		return err
	}

	if count != 0 {
		return fmt.Errorf("Person with E-Mail %s already exists", person.Mail)
	}

	person.Confirmed = false
	_, err = r.DB.NewInsert().Model(&person).Exec(ctx)
	if err != nil {
		return err
	}

	if os.Getenv("SMTP_HOST") == "" {
		fmt.Printf("Email Server not configured. Skipping verification for %s", person.Mail)
	} else {
		utils.SendConfirmationMail(person)
	}

	return nil
}

func (r *Resolver) GetPerson(ctx context.Context, mail string) (*models.Person, error) {
	person := new(models.Person)
	err := r.DB.NewSelect().
		Model(person).
		Where("mail = ?", mail).
		Scan(ctx)

	if err != nil {
		return nil, err
	}

	return person, nil
}
