package models

import (
	"time"

	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	Mail         string `bun:",pk,notnull,type:varchar(255)"`
	Fn           string `bun:",notnull,type:varchar(255)"`
	Sn           string `bun:"type:varchar(255)"`
	Confirmed    bool   `bun:"confirmed,notnull"`
	SessionID    int32
	LastLogin    time.Time `bun:",default:current_timestamp"`
	PasswordHash string    `bun:"type:varchar(64)"`
	CreatedAt    time.Time `bun:",default:current_timestamp"`
}
