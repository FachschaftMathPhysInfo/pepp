package models

import (
	"github.com/uptrace/bun"
)

type Topic struct {
	bun.BaseModel `bun:"table:topics,alias:to"`

	Name  string `bun:",pk"`
	Color string `bun:"color"`

	Events []*Event `bun:"rel:has-many,join:name=topic_name"`
}
