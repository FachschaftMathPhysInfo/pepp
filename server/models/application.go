package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Application struct {
	bun.BaseModel `bun:",alias:ap"`

	EventID     int32  `bun:",pk"`
	StudentMail string `bun:",notnull,type:varchar(255)"`
	Score       int16  `bun:",notnull,default:0"`
	Accepted    *bool

	Event   *Event `bun:"rel:belongs-to,join:event_id=id"`
	Student *User  `bun:"rel:belongs-to,join:student_mail=mail"`
	Form    *Form  `bun:"rel:belongs-to,join:event_id=event_id"`
}

var _ bun.BeforeCreateTableHook = (*Application)(nil)

func (*Application) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "forms" ("event_id") ON DELETE CASCADE`)
	query.ForeignKey(`("student_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	return nil
}

type ApplicationToQuestion struct {
	bun.BaseModel `bun:",alias:aq"`

	ID          int32 `bun:",pk,autoincrement"`
	EventID     int32
	StudentMail string
	Application *Application `bun:"rel:belongs-to,join:event_id=event_id,join:student_mail=student_mail"`
	QuestionID  int32
	Question    *Question `bun:"rel:belongs-to,join:question_id=id"`

	AnswerID int32
	Answer   *Answer `bun:"rel:belongs-to,join:answer_id=id"`
	Value    string
}

var _ bun.BeforeCreateTableHook = (*ApplicationToQuestion)(nil)

func (*ApplicationToQuestion) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "forms" ("event_id") ON DELETE CASCADE`)
	query.ForeignKey(`("student_mail") REFERENCES "users" ("mail") ON DELETE CASCADE`)
	query.ForeignKey(`("question_id") REFERENCES "questions" ("id") ON DELETE CASCADE`)
	return nil
}
