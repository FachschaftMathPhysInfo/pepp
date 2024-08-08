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

type RoomToEventAvailability struct {
	bun.BaseModel `bun:"table:room_to_event_availabilitys,alias:rea"`

	RoomNumber string `bun:",pk,type:varchar(50)"`
	BuildingID int32  `bun:",pk"`
	Room       *Room  `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
	EventID    int32  `bun:",pk"`
	Event      *Event `bun:"rel:belongs-to,join:event_id=id"`
}

var _ bun.BeforeCreateTableHook = (*RoomToEventAvailability)(nil)

func (*RoomToEventAvailability) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("room_number", "building_id") REFERENCES "rooms" ("number", "building_id") ON DELETE CASCADE`)
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	return nil
}
