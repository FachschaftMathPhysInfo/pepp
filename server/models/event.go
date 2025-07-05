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
	NeedsTutors *bool
	UmbrellaID  *int32

	Umbrella         *Event      `bun:"rel:belongs-to,join:umbrella_id=id"`
	Topic            *Label      `bun:"rel:belongs-to,join:topic_name=name"`
	Type             *Label      `bun:"rel:belongs-to,join:type_name=name"`
	Tutorials        []*Tutorial `bun:"rel:has-many,join:id=event_id"`
	TutorsAvailable  []*User     `bun:"m2m:user_to_event_availabilities,join:Event=User"`
	RegistrationForm *Form       `bun:"rel:has-one,join:id=event_id"`
}

var _ bun.BeforeCreateTableHook = (*Event)(nil)

func (*Event) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("umbrella_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	return nil
}
