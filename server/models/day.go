package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Day struct {
	bun.BaseModel `bun:"table:days,alias:d"`

	ID   uuid.UUID `bun:"id,default:gen_random_uuid(),pk,type:uuid"`
	Name string    `bun:"name"`
	Date time.Time `bun:"date,notnull"`

	Events []*Event `bun:"rel:has-many,join:id=day_id"`
}
