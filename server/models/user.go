package models

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:",alias:u"`

	Mail      string `bun:",pk,notnull,type:varchar(255)"`
	Fn        string `bun:",notnull,type:varchar(255)"`
	Sn        string `bun:"type:varchar(255)"`
	Confirmed bool   `bun:"confirmed,notnull"`
	SessionID int32
	LastLogin time.Time `bun:",default:current_timestamp"`
	Password  string    `bun:"type:varchar(64)"`
	CreatedAt time.Time `bun:",default:current_timestamp"`

	EventsAvailable  []Event        `bun:"m2m:user_to_event_availabilitys,join:User=Event"`
	EventsAssigned   []Event        `bun:"m2m:event_to_user_assignments,join:User=Event"`
	EventsRegistered []Event        `bun:"m2m:user_to_event_registrations,join:User=Event"`
	Applications     []*Application `bun:"rel:has-many,join:mail=student_mail"`
}

type UserToEventAvailability struct {
	bun.BaseModel `bun:"table:user_to_event_availabilitys,alias:uea"`

	UserMail string `bun:",pk,type:varchar(255)"`
	User     *User  `bun:"rel:belongs-to,join:user_mail=mail"`
	EventID  int32  `bun:",pk"`
	Event    *Event `bun:"rel:belongs-to,join:event_id=id"`
}

var _ bun.BeforeCreateTableHook = (*UserToEventAvailability)(nil)

func (*UserToEventAvailability) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("user_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	return nil
}

type UserToEventRegistration struct {
	bun.BaseModel `bun:"table:user_to_event_registrations,alias:ser"`

	UserMail   string `bun:",pk,type:varchar(255)"`
	User       *User  `bun:"rel:belongs-to,join:user_mail=mail"`
	EventID    int32  `bun:",pk"`
	Event      *Event `bun:"rel:belongs-to,join:event_id=id"`
	RoomNumber string `bun:",pk,type:varchar(50)"`
	BuildingID int32  `bun:",pk"`
	Room       *Room  `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
}

var _ bun.BeforeCreateTableHook = (*UserToEventRegistration)(nil)

func (*UserToEventRegistration) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("user_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("room_number", "building_id") REFERENCES "rooms" ("number", "building_id") ON DELETE CASCADE`)
	return nil
}
