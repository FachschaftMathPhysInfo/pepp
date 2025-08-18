package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Room struct {
	bun.BaseModel `bun:",alias:r"`

	Number     string `bun:",pk,notnull,type:varchar(50)"`
	BuildingID int32  `bun:",pk"`
	Name       string `bun:",type:varchar(255)"`
	Capacity   int16
	Floor      int8

	Building *Building `bun:"rel:belongs-to,join:building_id=id"`
}

var _ bun.BeforeCreateTableHook = (*Room)(nil)

func (*Room) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("building_id") REFERENCES "buildings" ("id") ON DELETE CASCADE`)
	return nil
}
