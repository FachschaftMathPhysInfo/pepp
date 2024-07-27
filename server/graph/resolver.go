package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"github.com/uptrace/bun"
	"google.golang.org/api/forms/v1"
)

type Resolver struct {
	DB           *bun.DB
	FormsService *forms.FormsService
}
