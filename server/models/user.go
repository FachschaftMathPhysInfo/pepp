package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	Mail         string    `bun:"mail,pk,notnull"`
	Fn           string    `bun:"fn,notnull"`
	Sn           string    `bun:"sn"`
	Confirmed    bool      `bun:"confirmed,notnull"`
	SessionID    uuid.UUID `bun:"session_id,type:uuid"`
	LastLogin    time.Time `bun:"last_login,default:current_timestamp"`
	PasswordHash string    `bun:"password_hash"`
	CreatedAt    time.Time `bun:"created_at,default:current_timestamp"`

	Events []Event `bun:"m2m:user_to_events,join:User=Event"`
}

type UserToEvent struct {
	UserMail string    `bun:",pk"`
	User     *User     `bun:"rel:belongs-to,join:user_mail=mail"`
	EventID  uuid.UUID `bun:",pk,type:uuid"`
	Event    *Event    `bun:"rel:belongs-to,join:event_id=id"`
}
