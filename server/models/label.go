package models

import (
	"github.com/uptrace/bun"
)

type Label struct {
	bun.BaseModel `bun:",alias:l"`

	ID    int32  `bun:",pk,autoincrement"`
	Name  string `bun:",type:varchar(50),unique"`
	Color string `bun:",type:varchar(7)"`
	Kind  string `bun:",notnull,type:varchar(20)"`
}
