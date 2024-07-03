package models

type Tutor struct {
	User `bun:",inherit"`

	EventsAvailable []Event `bun:"m2m:tutor_to_events,join:Tutor=Event"`
	EventsAssigned  []Event `bun:"m2m:event_to_tutors,join:Tutor=Event"`
}

func (Tutor) IsUser() {}

type TutorToEvent struct {
	TutorMail string `bun:",pk"`
	Tutor     *Tutor `bun:"rel:belongs-to,join:tutor_mail=mail"`
	EventID   int    `bun:",pk"`
	Event     *Event `bun:"rel:belongs-to,join:event_id=id"`
}
