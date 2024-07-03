package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Event struct {
	bun.BaseModel `bun:"table:events,alias:e"`

	ID          uuid.UUID `bun:"id,default:gen_random_uuid(),pk,type:uuid"`
	Title       string    `bun:"title,notnull"`
	Description string    `bun:"description"`
	TopicName   string    `bun:"topic_name,notnull"`
	Link        string    `bun:"link"`
	From        time.Time `bun:"from,notnull"`
	To          time.Time `bun:"to,notnull"`
	NeedsTutors bool      `bun:"needs_tutors,notnull"`

	Topic                  *Topic  `bun:"rel:belongs-to,join:topic_name=name"`
	AssignedTutorsWithRoom []Tutor `bun:"m2m:event_to_tutors,join:Event=Tutor"`
	AvailableTutors        []Tutor `bun:"m2m:user_to_events,join:Event=User"`
	RoomsAvailable         []Room  `bun:"m2m:event_to_rooms,join:Event=Room"`
}

type EventToTutor struct {
	EventID        uuid.UUID `bun:",pk,type:uuid"`
	Event          *Event    `bun:"rel:belongs-to,join:event_id=id"`
	TutorMail      string    `bun:",pk"`
	Tutor          *Tutor    `bun:"rel:belongs-to,join:tutor_mail=mail"`
	RoomNumber     string    `bun:",notnull"`
	RoomBuildingID uuid.UUID `bun:",notnull,type:uuid"`
	Room           *Room     `bun:"rel:belongs-to,join:room_number=number,join:room_building_id=building_id"`
}

type EventToRoom struct {
	EventID        uuid.UUID `bun:"event_id,pk,type:uuid"`
	Event          *Event    `bun:"rel:belongs-to,join:event_id=id"`
	RoomNumber     string    `bun:"room_number,pk"`
	RoomBuildingID uuid.UUID `bun:"room_building_id,pk,type:uuid"`
	Room           *Room     `bun:"rel:belongs-to,join:room_number=number,join:room_building_id=building_id"`
}
