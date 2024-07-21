package models

type Topic struct {
	Label `bun:",inherit"`

	Events []*Event `bun:"rel:has-many,join:name=topic"`
}
