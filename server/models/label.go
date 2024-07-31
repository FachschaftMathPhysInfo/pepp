package models

import (
	"github.com/uptrace/bun"
)

type Label struct {
	bun.BaseModel `bun:"table:labels,alias:l"`

	Name  string `bun:",pk,type:varchar(50)"`
	Color string `bun:",type:varchar(7)"`
	Kind  string `bun:",notnull,type:varchar(20)"`
}
