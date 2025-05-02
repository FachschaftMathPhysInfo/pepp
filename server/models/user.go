package models

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:",alias:u"`

	Mail      string    `bun:"type:varchar(255),pk"`
	Fn        string    `bun:"type:varchar(255),notnull"`
	Sn        string    `bun:"type:varchar(255),notnull"`
	Confirmed bool      `bun:",notnull"`
	SessionID string    `bun:"type:varchar(11)"`
	LastLogin time.Time `bun:",nullzero,notnull,default:current_timestamp"`
	Password  string    `bun:"type:varchar(64)"`
	Salt      string    `bun:"type:varchar(22)"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp"`
	Role      string    `bun:"type:varchar(5),nullzero,notnull,default:'USER'"`

	Availabilities []Event        `bun:"m2m:user_to_event_availabilities,join:User=Event"`
	Tutorials      []Tutorial     `bun:"m2m:tutorial_to_user_assignments,join:User=Tutorial"`
	Registrations  []Tutorial     `bun:"m2m:user_to_tutorial_registrations,join:User=Tutorial"`
	Applications   []*Application `bun:"rel:has-many,join:mail=student_mail"`
}

type UserToEventAvailability struct {
	bun.BaseModel `bun:"table:user_to_event_availabilities,alias:uea"`

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

type UserToTutorialRegistration struct {
	bun.BaseModel `bun:"table:user_to_tutorial_registrations,alias:utr"`

	UserMail   string    `bun:",pk,type:varchar(255)"`
	User       *User     `bun:"rel:belongs-to,join:user_mail=mail"`
	TutorialID int32     `bun:",pk"`
	Tutorial   *Tutorial `bun:"rel:belongs-to,join:tutorial_id=id"`
}

var _ bun.BeforeCreateTableHook = (*UserToTutorialRegistration)(nil)

func (*UserToTutorialRegistration) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("user_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	query.ForeignKey(`("tutorial_id") REFERENCES "tutorials" ("id") ON DELETE CASCADE`)
	return nil
}
