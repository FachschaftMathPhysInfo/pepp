package models

import "github.com/uptrace/bun"

type Question struct {
	bun.BaseModel `bun:",alias:q"`

	ID     int32  `bun:",pk,autoincrement"`
	Title  string `bun:",notnull,type:varchar(255)"`
	Type   string `bun:",notnull,type:varchar(50)"`
	FormID int32

	Answers []*Answer `bun:"rel:has-many,join:id=question_id"`
	Form    *Form     `bun:"rel:belongs-to,join:form_id=event_id"`
}
