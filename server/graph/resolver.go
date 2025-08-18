package graph

//go:generate go run github.com/99designs/gqlgen generate

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"context"

	"github.com/FachschaftMathPhysInfo/pepp/server/email"
	"github.com/uptrace/bun"
)

type Resolver struct {
	DB         *bun.DB
	MailConfig *email.Config
	Settings   map[string]string
}

func (r *Resolver) FetchSettings(ctx context.Context) error {
	s, err := r.Query().Settings(ctx, nil, nil)
	if err != nil {
		return err
	}

	for _, setting := range s {
		r.Settings[setting.Key] = setting.Value
	}

	r.MailConfig.ApplySettings(r.Settings)

	return nil
}
