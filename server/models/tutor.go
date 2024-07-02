package models

type Tutor struct {
	User `bun:",inherit"`

	EventsAssigned []Event `bun:"m2m:event_to_tutors,join:Tutor=Event"`
}

func (Tutor) IsUser()                 {}
func (this Tutor) GetFn() string      { return this.Fn }
func (this Tutor) GetSn() string      { return this.Sn }
func (this Tutor) GetMail() string    { return this.Mail }
func (this Tutor) GetConfirmed() bool { return this.Confirmed }
