package models

import (
	"time"

	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	Mail         string    `bun:"mail,pk,notnull"`
	Fn           string    `bun:"fn,notnull"`
	Sn           string    `bun:"sn"`
	Confirmed    bool      `bun:"confirmed,notnull"`
	SessionID    int       `bun:"session_id"`
	LastLogin    time.Time `bun:"last_login,default:current_timestamp"`
	PasswordHash string    `bun:"password_hash"`
	CreatedAt    time.Time `bun:"created_at,default:current_timestamp"`
}
