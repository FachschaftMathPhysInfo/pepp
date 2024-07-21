package models

type EventType struct {
	Label `bun:",inherit"`

	Events []*Event `bun:"rel:has-many,join:name=type"`
}
