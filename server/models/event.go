package models

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:",alias:e"`

	ID          int32  `bun:",pk,autoincrement"`
	Title       string `bun:",notnull,type:varchar(255)"`
	Description string
	TopicName   string    `bun:",type:varchar(50)"`
	TypeName    string    `bun:",type:varchar(50)"`
	From        time.Time `bun:",notnull"`
	To          time.Time `bun:",notnull"`
	NeedsTutors bool      `bun:",notnull"`
	UmbrellaID  *int32

	Umbrella         *Event `bun:"rel:belongs-to,join:umbrella_id=id"`
	Topic            *Label `bun:"rel:belongs-to,join:topic_name=name"`
	Type             *Label `bun:"rel:belongs-to,join:type_name=name"`
	TutorsAssigned   []User `bun:"m2m:event_to_user_assignments,join:Event=User"`
	TutorsAvailable  []User `bun:"m2m:user_to_event_availabilities,join:Event=User"`
	RegistrationForm *Form  `bun:"rel:has-one,join:id=event_id"`
}

var _ bun.BeforeCreateTableHook = (*Event)(nil)

func (*Event) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("umbrella_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	return nil
}

type EventToUserAssignment struct {
	bun.BaseModel `bun:"table:event_to_user_assignments,alias:eta"`

	EventID    int32     `bun:",pk"`
	Event      *Event    `bun:"rel:belongs-to,join:event_id=id"`
	UserMail   string    `bun:",pk"`
	User       *User     `bun:"rel:belongs-to,join:user_mail=mail"`
	RoomNumber string    `bun:",pk,type:varchar(50)"`
	BuildingID int32     `bun:",pk"`
	Building   *Building `bun:"rel:belongs-to,join:building_id=id"`
	Room       *Room     `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
}

var _ bun.BeforeCreateTableHook = (*EventToUserAssignment)(nil)

func (*EventToUserAssignment) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("user_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	query.ForeignKey(`("room_number", "building_id") REFERENCES "rooms" ("number", "building_id") ON DELETE CASCADE`)
	return nil
}
