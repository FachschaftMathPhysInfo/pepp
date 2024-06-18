package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/google/uuid"
)

// AddRegistration is the resolver for the addRegistration field.
func (r *mutationResolver) AddRegistration(ctx context.Context, input model.NewStudent) (string, error) {
	panic(fmt.Errorf("not implemented: AddRegistration - addRegistration"))
}

// NewEvent is the resolver for the newEvent field.
func (r *mutationResolver) NewEvent(ctx context.Context, input model.NewEvent) (string, error) {
	from, err := time.Parse(time.RFC3339, input.From)
	if err != nil {
		return "PARSE_TIME_FAILURE", fmt.Errorf("unable to parse timestamp: %s", input.From)
	}

	to, err := time.Parse(time.RFC3339, input.To)
	if err != nil {
		return "PARSE_TIME_FAILURE", fmt.Errorf("unable to parse timestamp: %s", input.To)
	}

	event := &models.Event{
		ID:          uuid.New(),
		TutorID:     uuid.MustParse(input.TutorID),
		Title:       input.Title,
		Description: *input.Description,
		From:        from,
		To:          to,
	}

	_, err = r.DB.NewInsert().Model(event).Exec(ctx)
	if err != nil {
		return "INSERT_EVENT_FAILURE", err
	}

	return "SUCCESS_EVENT_INSERT", nil
}

// Students is the resolver for the students field.
func (r *queryResolver) Students(ctx context.Context) ([]*model.Student, error) {
	panic(fmt.Errorf("not implemented: Students - students"))
}

// Events is the resolver for the events field.
func (r *queryResolver) Events(ctx context.Context) ([]*model.Event, error) {
	var events []*models.Event
	err := r.DB.NewSelect().Model(&events).Scan(ctx)
	if err != nil {
		return nil, err
	}
  var transformedEvents []*model.Event
    for _, event := range events {
      transformedEvent := &model.Event{
        ID:          event.ID.String(),
        Tutor:       nil, 
        Title:       event.Title,
        Description: &event.Description,
        From:        event.From.Format(time.RFC3339),
        To:          event.To.Format(time.RFC3339),
      }
    transformedEvents = append(transformedEvents, transformedEvent)
  }

  return transformedEvents, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
