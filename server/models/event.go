package models

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:",alias:e"`

	ID                 int32  `bun:",pk,autoincrement"`
	Title              string `bun:",notnull,type:varchar(255)"`
	Description        string
	TypeID             int32
	From               time.Time `bun:",notnull"`
	To                 time.Time `bun:",notnull"`
	NeedsTutors        *bool
	UmbrellaID         *int32
	TutorialsOpen      *bool `bun:",notnull,default:false"`
	RegistrationNeeded *bool `bun:",notnull,default:true"`

	Umbrella         *Event      `bun:"rel:belongs-to,join:umbrella_id=id"`
	Topics           []*Label    `bun:"m2m:topic_to_events,join:Event=Topic"`
	Type             *Label      `bun:"rel:belongs-to,join:type_id=id"`
	Tutorials        []*Tutorial `bun:"rel:has-many,join:id=event_id"`
	TutorsAvailable  []*User     `bun:"m2m:user_to_event_availabilities,join:Event=User"`
	RegistrationForm *Form       `bun:"rel:has-one,join:id=event_id"`
	SupportingEvents []Event     `bun:"m2m:event_to_supporting_events,join:Event=SupportingEvent"`
}

var _ bun.BeforeCreateTableHook = (*Event)(nil)

func (*Event) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("umbrella_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	return nil
}

type TopicToEvent struct {
	bun.BaseModel `bun:"table:topic_to_events,alias:tte"`

	EventID int32  `bun:",pk"`
	Event   *Event `bun:"rel:belongs-to,join:event_id=id"`
	TopicID int32  `bun:",pk"`
	Topic   *Label `bun:"rel:belongs-to,join:topic_id=id"`
}

var _ bun.BeforeCreateTableHook = (*TopicToEvent)(nil)

func (*TopicToEvent) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("topic_id") REFERENCES "labels" ("id") ON DELETE CASCADE`)
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
