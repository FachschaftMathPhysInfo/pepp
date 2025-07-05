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

	Umbrella         *Event     `bun:"rel:belongs-to,join:umbrella_id=id"`
	Topic            *Label     `bun:"rel:belongs-to,join:topic_name=name"`
	Type             *Label     `bun:"rel:belongs-to,join:type_name=name"`
	Tutorials        []Tutorial `bun:"rel:has-many,join:id=event_id"`
	TutorsAvailable  []User     `bun:"m2m:user_to_event_availabilities,join:Event=User"`
	RegistrationForm *Form      `bun:"rel:has-one,join:id=event_id"`
	SupportingEvents []Event    `bun:"m2m:event_to_supporting_events,join:Event=SupportingEvent"`
}

var _ bun.BeforeCreateTableHook = (*Event)(nil)

func (*Event) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("umbrella_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	return nil
}

type EventToSupportingEvent struct {
	bun.BaseModel `bun:"table:event_to_supporting_events,alias:ese"`

	EventID           int32  `bun:",pk"`
	Event             *Event `bun:"rel:belongs-to,join:event_id=id"`
	SupportingEventID int32  `bun:",pk"`
	SupportingEvent   *Event `bun:"rel:belongs-to,join:supporting_event_id=id"`
}

var _ bun.BeforeCreateTableHook = (*EventToSupportingEvent)(nil)

func (*EventToSupportingEvent) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("supporting_event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	return nil
}
