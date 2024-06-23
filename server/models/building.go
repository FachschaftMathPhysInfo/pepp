package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Building struct {
	bun.BaseModel `bun:"table:buildings,alias:b"`

	ID     uuid.UUID `bun:"id,pk,type:uuid"`
	Name   string    `bun:"name,notnull"`
	Street string    `bun:"street"`
	Number int       `bun:"number"`
	City   string    `bun:"city"`
	Zip    int       `bun:"zip"`
}
