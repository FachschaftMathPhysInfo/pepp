package models

import (
	"github.com/uptrace/bun"
)

type Label struct {
	bun.BaseModel `bun:"table:labels,alias:l"`

	Name  string `bun:",pk"`
	Color string
	Kind  string `bun:",notnull"`
}
