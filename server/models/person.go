package models

import (
	"time"

	"github.com/uptrace/bun"
)

type PersonType string

const (
	PersonTypeStudent PersonType = "STUDENT"
	PersonTypeTutor   PersonType = "TUTOR"
)

func (p PersonType) String() string {
	return string(p)
}

type Person struct {
	bun.BaseModel `bun:"table:people,alias:p"`

	Fn        string     `bun:"fn,notnull"`
	Sn        string     `bun:"sn"`
	Mail      string     `bun:"mail,pk,notnull"`
	Confirmed bool       `bun:"confirmed,notnull"`
	Type      PersonType `bun:"type,notnull,type:person_type"`
	CreatedAt time.Time  `bun:"created_at,default:current_timestamp"`
}

type Tutor struct {
	Person
}

func (Tutor) IsPerson()               {}
func (this Tutor) GetFn() string      { return this.Fn }
func (this Tutor) GetSn() string      { return this.Sn }
func (this Tutor) GetMail() string    { return this.Mail }
func (this Tutor) GetConfirmed() bool { return this.Confirmed }
