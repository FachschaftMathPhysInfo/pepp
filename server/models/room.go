package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Room struct {
	bun.BaseModel `bun:"table:rooms,alias:r`

	ID          uuid.UUID `bun:"type:uuid,default:uuid_generate_v4()"`
  BuildingId  uuid.UUID `bun:"type:uuid"`
  Number      string `bun:"number"`
}
