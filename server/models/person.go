package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Person struct {
	bun.BaseModel `bun:"table:people,alias:p"`

	Mail         string    `bun:"mail,pk,notnull"`
	Fn           string    `bun:"fn,notnull"`
	Sn           string    `bun:"sn"`
	Confirmed    bool      `bun:"confirmed,notnull"`
	SessionID    uuid.UUID `bun:"session_id,type:uuid"`
	LastLogin    time.Time `bun:"last_login,default:current_timestamp"`
	PasswordHash string    `bun:"password_hash"`
	CreatedAt    time.Time `bun:"created_at,default:current_timestamp"`
}

type Tutor struct {
	Person `bun:",inherit"`

	EventsAvailable []Event `bun:"m2m:tutor_to_events,join:Tutor=Event"`
	EventsAssigned  []Event `bun:"m2m:event_to_tutors,join:Tutor=Event"`
}

type TutorToEvent struct {
	TutorMail string    `bun:",pk"`
	Tutor     *Tutor    `bun:"rel:belongs-to,join:tutor_mail=mail"`
	EventID   uuid.UUID `bun:",pk,type:uuid"`
	Event     *Event    `bun:"rel:belongs-to,join:event_id=id"`
}

func (Tutor) IsPerson()               {}
func (this Tutor) GetFn() string      { return this.Fn }
func (this Tutor) GetSn() string      { return this.Sn }
func (this Tutor) GetMail() string    { return this.Mail }
func (this Tutor) GetConfirmed() bool { return this.Confirmed }
