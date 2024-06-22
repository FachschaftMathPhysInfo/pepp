package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Room struct {
	bun.BaseModel `bun:"table:rooms,alias:r"`

	ID          uuid.UUID `bun:"id,pk,type:uuid"`
  BuildingId  uuid.UUID `bun:"buildingId,notnull,type:uuid"`
  Number      string `bun:"number"`
}
