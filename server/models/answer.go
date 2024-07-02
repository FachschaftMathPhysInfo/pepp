package models

import (
	"github.com/uptrace/bun"
)

type Answer struct {
	bun.BaseModel `bun:"table:answers,alias:a"`

	Number      int    `bun:"number,pk"`
	StudentMail string `bun:"student_mail,pk"`
	Text        string `bun:"text"`
	Score       int    `bun:"value,notnull"`

	Student *Student `bun:"rel:belongs-to,join:student_mail=mail"`
}
