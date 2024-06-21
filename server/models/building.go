package models

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Building struct {
	bun.BaseModel `bun:"table:buildings,alias:b`

	ID          uuid.UUID `bun:"type:uuid,default:uuid_generate_v4()"`
  Name        string `bun:"name"`
  Street      string `bun:"street"`
  Number      int `bun:"number"`
  City        string `bun:"city"`
  Zip         int `bun:"zip"`
}
