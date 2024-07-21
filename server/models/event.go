package models

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:"table:events,alias:e"`

	ID          int32  `bun:",pk,autoincrement"`
	Title       string `bun:",notnull"`
	Description string
	Topic       string `bun:",notnull"`
	Type        string `bun:",notnull"`
	Link        string
	From        time.Time `bun:",notnull"`
	To          time.Time `bun:",notnull"`
	NeedsTutors bool      `bun:",notnull"`

	TutorsAssigned  []Tutor `bun:"m2m:event_to_tutors,join:Event=Tutor"`
	TutorsAvailable []Tutor `bun:"m2m:tutor_to_events,join:Event=Tutor"`
	RoomsAvailable  []Room  `bun:"m2m:room_to_events,join:Event=Room"`
}

var _ bun.BeforeCreateTableHook = (*Event)(nil)

func (*Event) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("topic") REFERENCES "labels" ("name") ON DELETE CASCADE`)
	return nil
}

type EventToTutor struct {
	EventID    int32  `bun:",pk"`
	Event      *Event `bun:"rel:belongs-to,join:event_id=id"`
	TutorMail  string `bun:",pk"`
	Tutor      *Tutor `bun:"rel:belongs-to,join:tutor_mail=mail"`
	RoomNumber string `bun:",pk"`
	BuildingID int32  `bun:",pk"`
	Room       *Room  `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
}

var _ bun.BeforeCreateTableHook = (*EventToTutor)(nil)

func (*EventToTutor) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("tutor_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	query.ForeignKey(`("room_number", "building_id") REFERENCES "rooms" ("number", "building_id") ON DELETE CASCADE`)
	return nil
}
