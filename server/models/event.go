package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:"table:events,alias:e"`

	ID          uuid.UUID `bun:"id,pk,type:uuid"`
	TutorID     uuid.UUID `bun:"tutorId,type:uuid"`
  Title       string `bun:"title,notnull"`
  Description string `bun:"description"`
	From        time.Time `bun:"type:timestamptz"`
	To          time.Time `bun:"type:timestamptz"`
}
