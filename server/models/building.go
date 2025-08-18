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
	Zip       string  `bun:",notnull,type:varchar(10)"`
	Latitude  float64 `bun:",notnull"`
	Longitude float64 `bun:",notnull"`
	ZoomLevel int     `bun:",notnull"`

	Rooms []*Room `bun:"rel:has-many,join:id=building_id"`
}
