package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Form struct {
	bun.BaseModel `bun:",alias:f"`

	EventID     int32  `bun:",pk"`
	Title       string `bun:",notnull,type:varchar(255)"`
	Description string

	Questions []*Question `bun:"rel:has-many,join:event_id=form_id"`
}

var _ bun.BeforeCreateTableHook = (*Form)(nil)

func (*Form) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "events" ("id")`)
	return nil
}
