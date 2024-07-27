package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Form struct {
	bun.BaseModel `bun:"table:forms,alias:f"`

	ID                  string `bun:",pk"`
	Name                string `bun:",notnull"`
	TemplateID          string
	MaxRegistrations    int16
	AcceptanceThreshold int8

	Template      *Form           `bun:"rel:belongs-to,join:template_id=id"`
	Forms         []*Form         `bun:"rel:has-many,join:id=template_id"`
	Events        []*Event        `bun:"rel:has-many,join:id=form_id"`
	Registrations []*Registration `bun:"rel:has-many,join:id=form_id"`
}

var _ bun.BeforeCreateTableHook = (*Form)(nil)

func (*Form) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("template_id") REFERENCES "forms" ("id") ON DELETE CASCADE`)
	return nil
}
