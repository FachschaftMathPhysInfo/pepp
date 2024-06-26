package models

import (
	"time"

	"github.com/uptrace/bun"
)

type PersonType string

const (
	Student PersonType = "STUDENT"
	Tutor   PersonType = "TUTOR"
)

func (e PersonType) String() string {
	return string(e)
}

type Person struct {
	bun.BaseModel `bun:"table:people,alias:p"`

	Fn        string     `bun:"fn,notnull"`
	Sn        string     `bun:"sn"`
	Mail      string     `bun:"mail,pk,notnull"`
	Confirmed bool       `bun:"confirmed,notnull"`
	Type      PersonType `bun:"type,notnull,type:person_type"`
	CreatedAt time.Time  `bun:"created_at,notnull,type:timestamptz"`
}
