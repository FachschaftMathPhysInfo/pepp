package models

import (
  "time"

  "github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Event struct {
  bun.BaseModel `bun:"table:events,alias:e`

  ID          uuid.UUID `bun:"type:uuid,default:uuid_generate_v4()"`
  TutorID     uuid.UUID `bun:"type:uuid"`
  Title       string
  Description string
  From        time.Time `bun:"type:timestamptz"`
  To          time.Time `bun:"type:timestamptz"`
}
