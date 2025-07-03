package models

import (
	"context"

	"github.com/uptrace/bun"
)

type Tutorial struct {
	bun.BaseModel `bun:",alias:t"`

	ID         int32  `bun:",pk,autoincrement"`
	EventID    int32  `bun:",notnull"`
	RoomNumber string `bun:",notnull"`
	BuildingID int32  `bun:",notnull"`

	Event *Event `bun:"rel:belongs-to,join:event_id=id"`
	Room  *Room  `bun:"rel:belongs-to,join:room_number=number,join:building_id=building_id"`
}

var _ bun.BeforeCreateTableHook = (*Tutorial)(nil)

func (*Tutorial) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("event_id") REFERENCES "events" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("room_number", "building_id") REFERENCES "rooms" ("number", "building_id") ON DELETE CASCADE`)
	return nil
}

type TutorialToUserAssignment struct {
	bun.BaseModel `bun:"table:tutorial_to_user_assignments,alias:tua"`

	UserID     int32     `bun:",pk"`
	User       *User     `bun:"rel:belongs-to,join:user_id=id"`
	TutorialID int32     `bun:",pk"`
	Tutorial   *Tutorial `bun:"rel:belongs-to,join:tutorial_id=id"`
}

var _ bun.BeforeCreateTableHook = (*TutorialToUserAssignment)(nil)

func (*TutorialToUserAssignment) BeforeCreateTable(ctx context.Context, query *bun.CreateTableQuery) error {
	query.ForeignKey(`("user_id") REFERENCES "users" ("id") ON DELETE CASCADE`)
	query.ForeignKey(`("tutorial_id") REFERENCES "tutorials" ("id") ON DELETE CASCADE`)
	return nil
}
