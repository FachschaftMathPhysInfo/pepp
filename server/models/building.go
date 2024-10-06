package models

import (
	"github.com/uptrace/bun"
)

type Building struct {
	bun.BaseModel `bun:",alias:b"`

	ID        int32   `bun:",pk,autoincrement"`
	Name      string  `bun:",type:varchar(255)"`
	Street    string  `bun:",notnull,type:varchar(255)"`
	Number    string  `bun:",notnull,type:varchar(255)"`
	City      string  `bun:",notnull,type:varchar(255)"`
	Zip       int32   `bun:",notnull"`
	Latitude  float64 `bun:",notnull,type:decimal(9,6)"`
	Longitude float64 `bun:",notnull,type:decimal(9,6)"`
	ZoomLevel int8    `bun:"default:15"`

	Rooms []*Room `bun:"rel:has-many,join:id=building_id"`
}
