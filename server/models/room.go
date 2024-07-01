package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Room struct {
	bun.BaseModel `bun:"table:rooms,alias:r"`

	Number     string    `bun:"number,pk,notnull"`
	Name       string    `bun:"name"`
	Capacity   int       `bun:"capacity"`
	Floor      int       `bun:"floor"`
	BuildingID uuid.UUID `bun:"building_id,pk,type:uuid"`

	Building *Building `bun:"rel:belongs-to,join:building_id=id"`
}
