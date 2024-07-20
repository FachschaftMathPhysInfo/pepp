package models

import (
	"github.com/uptrace/bun"
)

type Building struct {
	bun.BaseModel `bun:"table:buildings,alias:b"`

	ID     int32  `bun:"id,pk,autoincrement"`
	Name   string `bun:"name,notnull"`
	Street string `bun:"street,notnull"`
	Number string `bun:"number,notnull"`
	City   string `bun:"city,notnull"`
	Zip    int32  `bun:"zip,notnull"`
	Osm    string `bun:"osm,notnull"`

	Rooms []*Room `bun:"rel:has-many,join:id=building_id"`
}
