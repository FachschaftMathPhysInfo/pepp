package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Application struct {
	bun.BaseModel `bun:",alias:ap"`

	EventID   int32 `bun:",pk"`
	StudentID int32 `bun:",pk"`
	Score     int16 `bun:",notnull"`
	Accepted  *bool `bun:",default:false"`

	Event   *Event `bun:"rel:belongs-to,join:event_id=id"`
	Student *User  `bun:"rel:belongs-to,join:student_id=id"`
	Form    *Form  `bun:"rel:belongs-to,join:event_id=event_id"`
}

var _ bun.BeforeCreateTableHook = (*Application)(nil)

func (*Application) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "forms" ("event_id") ON DELETE CASCADE`)
	query.ForeignKey(`("student_id") REFERENCES "users" ("id") ON DELETE CASCADE`)
	return nil
}

type ApplicationToQuestion struct {
	bun.BaseModel `bun:",alias:aq"`

	ID          int32 `bun:",pk,autoincrement"`
	EventID     int32
	StudentID   int32
	Application *Application `bun:"rel:belongs-to,join:event_id=event_id,join:student_id=student_id"`
	QuestionID  int32
	Question    *Question `bun:"rel:belongs-to,join:question_id=id"`

	AnswerID int32
	Answer   *Answer `bun:"rel:belongs-to,join:answer_id=id"`
	Value    string
}

var _ bun.BeforeCreateTableHook = (*ApplicationToQuestion)(nil)

func (*ApplicationToQuestion) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "forms" ("event_id") ON DELETE CASCADE`)
	query.ForeignKey(`("student_id") REFERENCES "users" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("question_id") REFERENCES "questions" ("id") ON DELETE CASCADE`)
	return nil
}
