package models

import "github.com/uptrace/bun"

type Setting struct {
	bun.BaseModel `bun:"table:settings,alias:s"`

	Name  string `bun:",pk,type:varchar(255)"`
	Value string `bun:",notnull"`
	Type  string `bun:"notnull,type:varchar(50)"`
}
