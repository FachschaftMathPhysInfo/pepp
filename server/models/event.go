package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:"table:events,alias:e"`

	ID          int       `bun:"id,pk,autoincrement"`
	Title       string    `bun:"title,notnull"`
	Description string    `bun:"description"`
	TopicName   string    `bun:"topic_name,notnull"`
	Link        string    `bun:"link"`
	From        time.Time `bun:"from,notnull"`
	To          time.Time `bun:"to,notnull"`
	NeedsTutors bool      `bun:"needs_tutors,notnull"`

	Topic           *Topic  `bun:"rel:belongs-to,join:topic_name=name"`
	TutorsAssigned  []Tutor `bun:"m2m:event_to_tutors,join:Event=Tutor"`
	TutorsAvailable []Tutor `bun:"m2m:tutor_to_events,join:Event=Tutor"`
	RoomsAvailable  []Room  `bun:"m2m:room_to_events,join:Event=Room"`
}

type EventToTutor struct {
	EventID    int    `bun:",pk"`
	Event      *Event `bun:"rel:belongs-to,join:event_id=id"`
	TutorMail  string `bun:",pk"`
	Tutor      *Tutor `bun:"rel:belongs-to,join:tutor_mail=mail"`
	RoomNumber string `bun:",notnull"`
	BuildingID int    `bun:",notnull"`
	Room       *Room  `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
}
