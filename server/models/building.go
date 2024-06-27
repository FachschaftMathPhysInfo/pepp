package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Building struct {
	bun.BaseModel `bun:"table:buildings,alias:b"`

	ID      uuid.UUID `bun:"id,default:gen_random_uuid(),pk,type:uuid"`
	Name    string    `bun:"name,notnull"`
	Street  string    `bun:"street,notnull"`
	Number  string    `bun:"number,notnull"`
	City    string    `bun:"city,notnull"`
	Zip     int       `bun:"zip,notnull"`
	OsmLink string    `bun:"osm_link,notnull"`
	Rooms   []string  `bun:"rooms,array,notnull"`
}
