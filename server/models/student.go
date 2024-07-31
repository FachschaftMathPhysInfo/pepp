package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Student struct {
	User `bun:",inherit"`

	Score    int8
	Accepted bool

	EventsRegistered []Event `bun:"m2m:student_to_events,join:Student=Event"`
}

func (Student) IsUser() {}

type StudentToEvent struct {
	StudentMail string   `bun:",pk,type:varchar(255)"`
	Student     *Student `bun:"rel:belongs-to,join:student_mail=mail"`
	EventID     int32    `bun:",pk"`
	Event       *Event   `bun:"rel:belongs-to,join:event_id=id"`
	RoomNumber  string   `bun:",pk,type:varchar(50)"`
	BuildingID  int32    `bun:",pk"`
	Room        *Room    `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
}

var _ bun.BeforeCreateTableHook = (*StudentToEvent)(nil)

func (*StudentToEvent) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("student_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("room_number", "building_id") REFERENCES "rooms" ("number", "building_id") ON DELETE CASCADE`)
	return nil
}
