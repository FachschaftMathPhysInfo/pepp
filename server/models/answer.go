package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Answer struct {
	bun.BaseModel `bun:",alias:a"`

	ID         int32  `bun:",pk,autoincrement"`
	Title      string `bun:",notnull,type:varchar(255)"`
	Points     int8   `bun:",notnull"`
	QuestionID int32
}

var _ bun.BeforeCreateTableHook = (*Answer)(nil)

func (*Answer) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("question_id") REFERENCES "questions" ("id") ON DELETE CASCADE`)
	return nil
}
