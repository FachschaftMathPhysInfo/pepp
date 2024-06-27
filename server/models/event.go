package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Subject string

const (
	Mathematics Subject = "MATHEMATICS"
	Physics     Subject = "PHYSICS"
	Informatics Subject = "INFORMATICS"
	General     Subject = "GENERAL"
)

type Event struct {
	bun.BaseModel `bun:"table:events,alias:e"`

	ID          uuid.UUID `bun:"id,default:gen_random_uuid(),pk,type:uuid"`
	TutorMail   string    `bun:"tutor_mail"`
	Title       string    `bun:"title,notnull"`
	Description string    `bun:"description"`
	BuildingId  uuid.UUID `bun:"building_id,type:uuid"`
	Room        string    `bun:"room"`
	Subject     Subject   `bun:"subject,notnull,type:subject"`
	From        time.Time `bun:"from,notnull"`
	To          time.Time `bun:"to,notnull"`
}
