package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/email"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
)

// TutorsAssigned is the resolver for the tutorsAssigned field.
func (r *eventResolver) TutorsAssigned(ctx context.Context, obj *models.Event) ([]*model.EventTutorRoomPair, error) {
	var eventToTutorRelations []*models.EventToTutor
	if err := r.DB.NewSelect().
		Model(&eventToTutorRelations).
		Relation("Room").
		Relation("Room.Building").
		Relation("Tutor").
		Where("event_id = ?", obj.ID).
		Scan(ctx); err != nil {
		return nil, err
	}

	roomMap := make(map[string]*model.EventTutorRoomPair)
	for _, eventToTutorRelation := range eventToTutorRelations {
		roomKey := eventToTutorRelation.Room.Number +
			strconv.Itoa(eventToTutorRelation.Room.BuildingID)
		if room, exists := roomMap[roomKey]; exists {
			room.Tutors = append(room.Tutors, eventToTutorRelation.Tutor)
		} else {
			roomMap[roomKey] = &model.EventTutorRoomPair{
				Tutors: []*models.Tutor{eventToTutorRelation.Tutor},
				Room:   eventToTutorRelation.Room,
			}
		}
	}

	var tutorRoomPairs []*model.EventTutorRoomPair
	for _, tutorRoomPair := range roomMap {
		tutorRoomPairs = append(tutorRoomPairs, tutorRoomPair)
	}

	return tutorRoomPairs, nil
}

// From is the resolver for the from field.
func (r *eventResolver) From(ctx context.Context, obj *models.Event) (string, error) {
	return obj.From.String(), nil
}

// To is the resolver for the to field.
func (r *eventResolver) To(ctx context.Context, obj *models.Event) (string, error) {
	return obj.To.String(), nil
}

// AddRegistration is the resolver for the addRegistration field.
func (r *mutationResolver) AddRegistration(ctx context.Context, student models.Student) (string, error) {
	panic(fmt.Errorf("not implemented: AddRegistration - addRegistration"))
}

// UpdateStudentAcceptedStatus is the resolver for the updateStudentAcceptedStatus field.
func (r *mutationResolver) UpdateStudentAcceptedStatus(ctx context.Context, studentMail string, accepted bool) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateStudentAcceptedStatus - updateStudentAcceptedStatus"))
}

// AddTutor is the resolver for the addTutor field.
func (r *mutationResolver) AddTutor(ctx context.Context, tutor models.Tutor) (string, error) {
	tutor.SessionID = rand.Intn(9999999-1000000+1) + 1000000
	if _, err := r.DB.NewInsert().
		Model(&tutor).
		Exec(ctx); err != nil {
		return "Failed to add tutor", err
	}

	if err := email.SendConfirmation(tutor.User); err != nil {
		return "Failed to send confirmation mail", err
	}

	return "Successfully added new Tutor", nil
}

// UpdateTutor is the resolver for the updateTutor field.
func (r *mutationResolver) UpdateTutor(ctx context.Context, tutorMail string, tutor models.Tutor) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateTutor - updateTutor"))
}

// AddEvent is the resolver for the addEvent field.
func (r *mutationResolver) AddEvent(ctx context.Context, event models.Event) (string, error) {
	if _, err := r.DB.NewInsert().
		Model(&event).
		Exec(ctx); err != nil {
		return "Failed to insert the event", err
	}

	return "Successfully inserted new event", nil
}

// UpdateEvent is the resolver for the updateEvent field.
func (r *mutationResolver) UpdateEvent(ctx context.Context, eventID int, event models.Event) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateEvent - updateEvent"))
}

// AddBuilding is the resolver for the addBuilding field.
func (r *mutationResolver) AddBuilding(ctx context.Context, building models.Building) (string, error) {
	if _, err := r.DB.NewInsert().
		Model(&building).
		Exec(ctx); err != nil {
		return "Failed to insert building", err
	}

	return "Successfully inserted new building", nil
}

// AddRoom is the resolver for the addRoom field.
func (r *mutationResolver) AddRoom(ctx context.Context, room models.Room) (string, error) {
	if _, err := r.DB.NewInsert().
		Model(&room).
		Exec(ctx); err != nil {
		return "Failed to insert room", err
	}

	return "Successfully inserted new room", nil
}

// UpdateBuilding is the resolver for the updateBuilding field.
func (r *mutationResolver) UpdateBuilding(ctx context.Context, buildingID int, building models.Building) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateBuilding - updateBuilding"))
}

// AddTopic is the resolver for the addTopic field.
func (r *mutationResolver) AddTopic(ctx context.Context, topic models.Topic) (string, error) {
	if _, err := r.DB.NewInsert().
		Model(&topic).
		Exec(ctx); err != nil {
		return "Failed to insert topic", err
	}

	return "Successfully inserted new topic", nil
}

// LinkAvailableRoomToEvent is the resolver for the linkAvailableRoomToEvent field.
func (r *mutationResolver) LinkAvailableRoomToEvent(ctx context.Context, link models.RoomToEvent) (string, error) {
	if _, err := r.DB.NewInsert().
		Model(&link).
		Exec(ctx); err != nil {
		return "Failed to link room to event", err
	}

	return "Successfully linked room to event", nil
}

// LinkTutorToEventAndRoom is the resolver for the linkTutorToEventAndRoom field.
func (r *mutationResolver) LinkTutorToEventAndRoom(ctx context.Context, link models.EventToTutor) (string, error) {
	res, err := r.DB.NewDelete().
		Model((*models.TutorToEvent)(nil)).
		Where("tutor_mail = ?", link.TutorMail).
		Exec(ctx)
	if err != nil {
		return "", err
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return "", fmt.Errorf("Tutor is not available for this event")
	}

	if _, err := r.DB.NewInsert().
		Model(&link).
		Exec(ctx); err != nil {
		return "Failed to link tutor to event and room", err
	}

	return "Successfully linked tutor to event and room", nil
}

// Students is the resolver for the students field.
func (r *queryResolver) Students(ctx context.Context, mail []string) ([]*models.Student, error) {
	panic(fmt.Errorf("not implemented: Students - students"))
}

// Tutors is the resolver for the tutors field.
func (r *queryResolver) Tutors(ctx context.Context, mail []string, eventID *int) ([]*models.Tutor, error) {
	var tutors []*models.Tutor

	query := r.DB.NewSelect().
		Model(&tutors).
		Relation("EventsAvailable")

	if eventID != nil {
		query = query.
			Relation("EventsAssigned").
			Where("event_id = ?", *eventID)
	}

	if mail != nil {
		query = query.Where("mail IN (?)", bun.In(mail))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return tutors, nil
}

// Events is the resolver for the events field.
func (r *queryResolver) Events(ctx context.Context, id []int, topic []string, needsTutors *bool) ([]*models.Event, error) {
	var events []*models.Event

	query := r.DB.NewSelect().
		Model(&events).
		Relation("Topic").
		Relation("TutorsAssigned").
		Relation("TutorsAvailable").
		Relation("RoomsAvailable")

	if topic != nil {
		query = query.Where("topic_name IN (?)", bun.In(topic))
	}

	if needsTutors != nil {
		query = query.Where("needs_tutors = ?", *needsTutors)
	}

	if id != nil {
		query = query.Where("id IN (?)", bun.In(id))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return events, nil
}

// Buildings is the resolver for the buildings field.
func (r *queryResolver) Buildings(ctx context.Context, id []int) ([]*models.Building, error) {
	var buildings []*models.Building

	query := r.DB.NewSelect().
		Model(&buildings).
		Relation("Rooms")

	if id != nil {
		query = query.Where("id IN (?)", bun.In(id))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return buildings, nil
}

// Rooms is the resolver for the rooms field.
func (r *queryResolver) Rooms(ctx context.Context, number []string, buildingID int) ([]*models.Room, error) {
	var rooms []*models.Room

	query := r.DB.NewSelect().
		Model(&rooms).
		Relation("Building").
		Where("building_id = ?", buildingID)

	if number != nil {
		query = query.Where("number IN (?)", bun.In(number))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return rooms, nil
}

// Topics is the resolver for the topics field.
func (r *queryResolver) Topics(ctx context.Context, name []string) ([]*models.Topic, error) {
	var topics []*models.Topic

	query := r.DB.NewSelect().
		Model(&topics).
		Relation("Events")

	if name != nil {
		query = query.Where("name IN (?)", bun.In(name))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return topics, nil
}

// Answers is the resolver for the answers field.
func (r *studentResolver) Answers(ctx context.Context, obj *models.Student) ([]string, error) {
	panic(fmt.Errorf("not implemented: Answers - answers"))
}

// From is the resolver for the from field.
func (r *newEventResolver) From(ctx context.Context, obj *models.Event, data string) error {
	from, err := time.Parse(time.RFC3339, data)
	if err != nil {
		return err
	}

	obj.From = from
	return nil
}

// To is the resolver for the to field.
func (r *newEventResolver) To(ctx context.Context, obj *models.Event, data string) error {
	to, err := time.Parse(time.RFC3339, data)
	if err != nil {
		return err
	}

	obj.To = to
	return nil
}

// EventsAvailable is the resolver for the eventsAvailable field.
func (r *newTutorResolver) EventsAvailable(ctx context.Context, obj *models.Tutor, data []int) error {
	var tutorToEventRelations []*models.TutorToEvent
	for _, eventId := range data {
		tutorToEventRelation := &models.TutorToEvent{
			TutorMail: obj.Mail,
			EventID:   eventId,
		}

		tutorToEventRelations = append(tutorToEventRelations, tutorToEventRelation)
	}

	for _, relation := range tutorToEventRelations {
		if _, err := r.DB.NewInsert().Model(relation).Exec(ctx); err != nil {
			return err
		}
	}

	return nil
}

// Event returns EventResolver implementation.
func (r *Resolver) Event() EventResolver { return &eventResolver{r} }

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

// Student returns StudentResolver implementation.
func (r *Resolver) Student() StudentResolver { return &studentResolver{r} }

// NewEvent returns NewEventResolver implementation.
func (r *Resolver) NewEvent() NewEventResolver { return &newEventResolver{r} }

// NewTutor returns NewTutorResolver implementation.
func (r *Resolver) NewTutor() NewTutorResolver { return &newTutorResolver{r} }

type eventResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type studentResolver struct{ *Resolver }
type newEventResolver struct{ *Resolver }
type newTutorResolver struct{ *Resolver }
