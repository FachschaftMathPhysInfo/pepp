package migrations

import (
	"embed"

	"github.com/uptrace/bun/migrate"
)

//go:embed *.go
var sqlFiles embed.FS

var Migrations = migrate.NewMigrations()

func init() {
	if err := Migrations.Discover(sqlFiles); err != nil {
		panic(err)
	}
}
