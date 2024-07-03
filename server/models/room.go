package models

import (
	"github.com/uptrace/bun"
)

type Room struct {
	bun.BaseModel `bun:"table:rooms,alias:r"`

	Number     string `bun:"number,pk,notnull"`
	Name       string `bun:"name"`
	Capacity   int    `bun:"capacity"`
	Floor      int    `bun:"floor"`
	BuildingID int    `bun:"building_id,pk"`

	Building *Building `bun:"rel:belongs-to,join:building_id=id"`
}

type RoomToEvent struct {
	RoomNumber string `bun:",pk"`
	BuildingID int    `bun:",pk"`
	Room       *Room  `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
	EventID    int    `bun:"event_id,pk"`
	Event      *Event `bun:"rel:belongs-to,join:event_id=id"`
}
