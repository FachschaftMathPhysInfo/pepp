package models

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type ConfirmationToken struct {
	bun.BaseModel `bun:",alias:ct"`

	UserID    int32
	Token     string    `bun:",pk,type:varchar(43)"`
	ExpiresAt time.Time `bun:",nullzero,notnull"`
}

var _ bun.BeforeCreateTableHook = (*ConfirmationToken)(nil)

func (*ConfirmationToken) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("user_id") REFERENCES "users" ("id") ON DELETE CASCADE`)
	return nil
}
