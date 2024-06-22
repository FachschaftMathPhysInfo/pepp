package models

import (
  "time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type PersonType string
const (
  Student PersonType = "student"
	Tutor		PersonType = "tutor"
)

type Person struct {
	bun.BaseModel `bun:"table:people,alias:p"`

	ID          uuid.UUID `bun:"id,pk,type:uuid"`
  Fn          string `bun:"fn,notnull"`
  Sn          string `bun:"sn"`
  Mail        string `bun:"mail,notnull"`
  Confirmed   bool `bun:"confirmed,notnull"`
  Type				PersonType `bun:"type,notnull,type:person_type"`
	CreatedAt   time.Time `bun:"createdAt,notnull,type:timestamptz"`
}
