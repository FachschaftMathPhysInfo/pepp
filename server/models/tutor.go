package models

import (
  "time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Tutor struct {
	bun.BaseModel `bun:"table:tutors,alias:t`

	ID          uuid.UUID `bun:"type:uuid,default:uuid_generate_v4()"`
  Fn          string `bun:"fn"`
  Sn          string `bun:"sn"`
  Mail        string `bun:"mail"`
  Confirmed   bool `bun:"confirmed"`
	CreatedAt   time.Time `bun:"type:timestamptz"`
}
