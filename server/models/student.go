package models

type Student struct {
	User `bun:",inherit"`

	Score    int  `bun:"score"`
	Accepted bool `bun:"accepted"`

	EventsRegistered []Event  `bun:"m2m:student_to_events,join:Student=Event"`
	Answers          []Answer `bun:"rel:has-many,join:mail=student_mail"`
}

func (Student) IsUser() {}

type StudentToEvent struct {
	StudentMail    string   `bun:",pk"`
	Student        *Student `bun:"rel:belongs-to,join:student_mail=mail"`
	EventID        int      `bun:",pk"`
	Event          *Event   `bun:"rel:belongs-to,join:event_id=id"`
	RoomNumber     string   `bun:",notnull"`
	RoomBuildingID int      `bun:",notnull"`
	Room           *Room    `bun:"rel:belongs-to,join:room_number=number,join:room_building_id=building_id"`
}
