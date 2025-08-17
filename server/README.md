# Welcome to the backend.

## api
See the [documentation](https://fachschaftmathphysinfo.github.io/pepp).

## database er-diagram
![ER-Diagram](models/pepp-er.svg)

## migrations

To run migrations:

```shell
BUNDEBUG=2 go run ./cmd/migrate db migrate
```

To rollback migrations:

```shell
go run ./cmd/migrate db rollback
```

To view status of migrations:

```shell
go run ./cmd/migrate db status
```

To create a migration:

```shell
go run . db create migration_name
```

To get help:

```shell
go run . db

NAME:
   bun db - database commands

USAGE:
   bun db command [command options] [arguments...]

COMMANDS:
   init        create migration tables
   migrate     migrate database
   rollback    rollback the last migration group
   unlock      unlock migrations
   create      create a migration
   help, h     Shows a list of commands or help for one command

OPTIONS:
   --help, -h  show help (default: false)
```

See [docs](https://bun.uptrace.dev/guide/migrations.html) for details.
