package models

import (
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:"table:events,alias:e"`

	ID          uuid.UUID     `bun:"id,pk,type:uuid"`
	TutorMail   string        `bun:"tutor_mail"`
	Title       string        `bun:"title,notnull"`
	Description string        `bun:"description"`
	BuildingId  uuid.UUID     `bun:"building_id,type:uuid"`
	Room        string        `bun:"room"`
	Subject     model.Subject `bun:"subject,notnull,type:subject"`
	From        time.Time     `bun:"type:timestamptz"`
	To          time.Time     `bun:"type:timestamptz"`
}
