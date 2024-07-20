package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Answer struct {
	bun.BaseModel `bun:"table:answers,alias:a"`

	Number      int8   `bun:",pk"`
	StudentMail string `bun:",pk"`
	Text        string
	Score       int8 `bun:",notnull"`

	Student *Student `bun:"rel:belongs-to,join:student_mail=mail"`
}

var _ bun.BeforeCreateTableHook = (*Answer)(nil)

func (*Answer) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("student_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	return nil
}
