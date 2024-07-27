package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Registration struct {
	bun.BaseModel `bun:"table:registrations,alias:re"`

	StudentMail string `bun:",pk"`
	FormID      string `bun:",pk"`
	Score       int8   `bun:",notnull"`

	Student *Student `bun:"rel:belongs-to,join:student_mail=mail"`
	Form    *Form    `bun:"rel:belongs-to,join:form_id=id"`
}

var _ bun.BeforeCreateTableHook = (*Registration)(nil)

func (*Registration) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("student_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	query.ForeignKey(`("form_id") REFERENCES "forms" ("id") ON DELETE CASCADE`)
	return nil
}
