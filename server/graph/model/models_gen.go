// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type Person interface {
	IsPerson()
	GetID() string
	GetFn() string
	GetSn() string
	GetMail() string
	GetConfirmed() bool
}

type Building struct {
	ID     string  `json:"id"`
	Name   *string `json:"name,omitempty"`
	Street string  `json:"street"`
	Number int     `json:"number"`
	City   string  `json:"city"`
	Zip    string  `json:"zip"`
}

type Event struct {
	ID          string    `json:"id"`
	Tutor       *Tutor    `json:"tutor,omitempty"`
	Title       string    `json:"title"`
	Description *string   `json:"description,omitempty"`
	Building    *Building `json:"building,omitempty"`
	Room        *Room     `json:"room,omitempty"`
	From        string    `json:"from"`
	To          string    `json:"to"`
}

type Mutation struct {
}

type NewEvent struct {
	TutorID     string  `json:"tutorId"`
	Title       string  `json:"title"`
	Description *string `json:"description,omitempty"`
	BuildingID  *string `json:"buildingId,omitempty"`
	RoomID      *string `json:"roomId,omitempty"`
	From        string  `json:"from"`
	To          string  `json:"to"`
}

type NewStudent struct {
	Fn      string   `json:"fn"`
	Sn      string   `json:"sn"`
	Mail    string   `json:"mail"`
	Answers []string `json:"answers,omitempty"`
}

type NewTutor struct {
	Fn   string `json:"fn"`
	Sn   string `json:"sn"`
	Mail string `json:"mail"`
}

type Query struct {
}

type Room struct {
	ID       string    `json:"id"`
	Building *Building `json:"building"`
	Number   string    `json:"number"`
}

type Student struct {
	ID        string   `json:"id"`
	Fn        string   `json:"fn"`
	Sn        string   `json:"sn"`
	Mail      string   `json:"mail"`
	Confirmed bool     `json:"confirmed"`
	Answers   []string `json:"answers"`
	Score     *int     `json:"score,omitempty"`
	Accepted  *bool    `json:"accepted,omitempty"`
}

func (Student) IsPerson()               {}
func (this Student) GetID() string      { return this.ID }
func (this Student) GetFn() string      { return this.Fn }
func (this Student) GetSn() string      { return this.Sn }
func (this Student) GetMail() string    { return this.Mail }
func (this Student) GetConfirmed() bool { return this.Confirmed }

type Tutor struct {
	ID        string `json:"id"`
	Fn        string `json:"fn"`
	Sn        string `json:"sn"`
	Mail      string `json:"mail"`
	Confirmed bool   `json:"confirmed"`
}

func (Tutor) IsPerson()               {}
func (this Tutor) GetID() string      { return this.ID }
func (this Tutor) GetFn() string      { return this.Fn }
func (this Tutor) GetSn() string      { return this.Sn }
func (this Tutor) GetMail() string    { return this.Mail }
func (this Tutor) GetConfirmed() bool { return this.Confirmed }
