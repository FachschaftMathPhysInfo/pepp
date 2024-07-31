package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Tutor struct {
	User `bun:",inherit"`

	EventsAvailable []Event `bun:"m2m:tutor_to_events,join:Tutor=Event"`
	EventsAssigned  []Event `bun:"m2m:event_to_tutors,join:Tutor=Event"`
}

func (Tutor) IsUser() {}

type TutorToEvent struct {
	TutorMail string `bun:",pk,type:varchar(255)"`
	Tutor     *Tutor `bun:"rel:belongs-to,join:tutor_mail=mail"`
	EventID   int32  `bun:",pk"`
	Event     *Event `bun:"rel:belongs-to,join:event_id=id"`
}

var _ bun.BeforeCreateTableHook = (*TutorToEvent)(nil)

func (*TutorToEvent) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("tutor_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	return nil
}
