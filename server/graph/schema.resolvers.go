package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/email"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	hermes "github.com/matcornic/hermes/v2"
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
			strconv.Itoa(int(eventToTutorRelation.Room.BuildingID))
		if room, exists := roomMap[roomKey]; exists {
			room.Tutors = append(room.Tutors, eventToTutorRelation.Tutor)
		} else {
			registrationsCount, err := r.DB.NewSelect().
				Model((*models.StudentToEvent)(nil)).
				Where("event_id = ?", obj.ID).
				Where("room_number = ?", eventToTutorRelation.Room.Name).
				Where("building_id = ?", eventToTutorRelation.BuildingID).
				Count(ctx)

			if err != nil {
				return nil, err
			}

			roomMap[roomKey] = &model.EventTutorRoomPair{
				Tutors:        []*models.Tutor{eventToTutorRelation.Tutor},
				Room:          eventToTutorRelation.Room,
				Registrations: &registrationsCount,
			}
		}
	}

	var tutorRoomPairs []*model.EventTutorRoomPair
	for _, tutorRoomPair := range roomMap {
		tutorRoomPairs = append(tutorRoomPairs, tutorRoomPair)
	}

	return tutorRoomPairs, nil
}

// Topic is the resolver for the topic field.
func (r *eventResolver) Topic(ctx context.Context, obj *models.Event) (*models.Label, error) {
	topics, err := r.Query().Labels(ctx, []string{obj.Topic}, []model.LabelKind{model.LabelKindTopic})
	if err != nil {
		return nil, err
	}

	return topics[0], nil
}

// Type is the resolver for the type field.
func (r *eventResolver) Type(ctx context.Context, obj *models.Event) (*models.Label, error) {
	types, err := r.Query().Labels(ctx, []string{obj.Type}, []model.LabelKind{model.LabelKindEventType})
	if err != nil {
		return nil, err
	}

	return types[0], nil
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
func (r *mutationResolver) UpdateStudentAcceptedStatus(ctx context.Context, mail string, accepted bool) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateStudentAcceptedStatus - updateStudentAcceptedStatus"))
}

// AddTutor is the resolver for the addTutor field.
func (r *mutationResolver) AddTutor(ctx context.Context, tutor models.Tutor) (string, error) {
	// database insert happens in the eventsAvailable resolver
	eventsAvailable, err := r.Query().Events(ctx, nil, nil, nil, nil, nil, nil, []string{tutor.Mail})
	table := hermes.Table{
		Columns: hermes.Columns{
			CustomWidth: map[string]string{
				os.Getenv("EMAIL_ASSIGNMENTS_DATE_TITLE"): "20%",
				os.Getenv("EMAIL_ASSIGNMENTS_KIND_TITLE"): "30%",
			}}}

	for _, event := range eventsAvailable {
		e := []hermes.Entry{
			{Key: os.Getenv("EMAIL_ASSIGNMENTS_EVENT_TITLE"), Value: event.Title},
			{Key: os.Getenv("EMAIL_ASSIGNMENTS_DATE_TITLE"), Value: event.From.Format("02.01")},
			{Key: os.Getenv("EMAIL_ASSIGNMENTS_KIND_TITLE"), Value: event.Type}}
		table.Data = append(table.Data, e)
	}

	mail := email.Email{
		Subject: os.Getenv("EMAIL_CONFIRM_SUBJECT"),
		Intros:  []string{os.Getenv("EMAIL_CONFIRM_INTRO")},
		Outros:  []string{os.Getenv("EMAIL_CONFIRM_OUTRO")},
		Table:   table}

	if err != nil {
		return "", err
	}

	mail.Actions = []hermes.Action{
		{
			Instructions: os.Getenv("EMAIL_CONFIRM_BUTTON_INSTRUCTION"),
			Button: hermes.Button{
				Color: os.Getenv("PRIMARY_COLOR"),
				Text:  os.Getenv("EMAIL_CONFIRM_BUTTON_TEXT"),
				Link: fmt.Sprintf("%s/confirm/%s",
					os.Getenv("PUBLIC_URL"), strconv.Itoa(int(tutor.SessionID)))}}}

	if err := email.Send(tutor.User, mail); err != nil {
		return "Failed to send confirmation mail", err
	}

	return "Successfully added new Tutor", nil
}

// UpdateTutor is the resolver for the updateTutor field.
func (r *mutationResolver) UpdateTutor(ctx context.Context, mail string, tutor models.Tutor) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateTutor - updateTutor"))
}

// DeleteUser is the resolver for the deleteUser field.
func (r *mutationResolver) DeleteUser(ctx context.Context, mail []string) (string, error) {
	if _, err := r.DB.NewDelete().
		Model((*models.User)(nil)).
		Where("mail IN (?)", bun.In(mail)).
		Exec(ctx); err != nil {
		return "", err
	}

	return "Successfully removed user(s)", nil
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
func (r *mutationResolver) UpdateEvent(ctx context.Context, id int, event models.Event) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateEvent - updateEvent"))
}

// DeleteEvent is the resolver for the deleteEvent field.
func (r *mutationResolver) DeleteEvent(ctx context.Context, id []int) (string, error) {
	if _, err := r.DB.NewDelete().
		Model((*models.Event)(nil)).
		Where("id IN (?)", bun.In(id)).
		Exec(ctx); err != nil {
		return "", err
	}

	return "Successfully removed event(s)", nil
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

// UpdateBuilding is the resolver for the updateBuilding field.
func (r *mutationResolver) UpdateBuilding(ctx context.Context, id int, building models.Building) (string, error) {
	panic(fmt.Errorf("not implemented: UpdateBuilding - updateBuilding"))
}

// DeleteBuilding is the resolver for the deleteBuilding field.
func (r *mutationResolver) DeleteBuilding(ctx context.Context, id []int) (string, error) {
	if _, err := r.DB.NewDelete().
		Model((*models.Building)(nil)).
		Where("id IN (?)", bun.In(id)).
		Exec(ctx); err != nil {
		return "", err
	}

	return "Successfully deleted building(s) and referenced room(s)", nil
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

// DeleteRoom is the resolver for the deleteRoom field.
func (r *mutationResolver) DeleteRoom(ctx context.Context, number string, buildingID int) (string, error) {
	if _, err := r.DB.NewDelete().
		Model((*models.Room)(nil)).
		Where("number = ?", number).
		Where("building_id = ?", buildingID).
		Exec(ctx); err != nil {
		return "", err
	}

	return "Successfully deleted room", nil
}

// AddLabel is the resolver for the addLabel field.
func (r *mutationResolver) AddLabel(ctx context.Context, label models.Label) (string, error) {
	if _, err := r.DB.NewInsert().
		Model(&label).
		Exec(ctx); err != nil {
		return "Failed to insert topic", err
	}

	return "Successfully inserted new label", nil
}

// DeleteLabel is the resolver for the deleteLabel field.
func (r *mutationResolver) DeleteLabel(ctx context.Context, name []string) (string, error) {
	if _, err := r.DB.NewDelete().
		Model((*models.Label)(nil)).
		Where("name IN (?)", bun.In(name)).
		Exec(ctx); err != nil {
		return "", err
	}

	return "Successfully deleted topic(s)", nil
}

// AddAvailableRoomToEvent is the resolver for the addAvailableRoomToEvent field.
func (r *mutationResolver) AddAvailableRoomToEvent(ctx context.Context, link models.RoomToEvent) (string, error) {
	if _, err := r.DB.NewInsert().
		Model(&link).
		Exec(ctx); err != nil {
		return "Failed to link room to event", err
	}

	return "Successfully linked room to event", nil
}

// DeleteRoomFromEvent is the resolver for the deleteRoomFromEvent field.
func (r *mutationResolver) DeleteRoomFromEvent(ctx context.Context, link models.RoomToEvent) (string, error) {
	if _, err := r.DB.NewDelete().
		Model(&link).
		Exec(ctx); err != nil {
		return "", err
	}

	return "Successfully unlinked room from event", nil
}

// AssignTutorToEvent is the resolver for the assignTutorToEvent field.
func (r *mutationResolver) AssignTutorToEvent(ctx context.Context, link models.EventToTutor) (string, error) {
	res, err := r.DB.NewDelete().
		Model((*models.TutorToEvent)(nil)).
		Where("tutor_mail = ?", link.TutorMail).
		Where("event_id = ?", link.EventID).
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

	event, err := r.Query().Events(ctx, []int{int(link.EventID)}, nil, nil, nil, nil, nil, nil)
	tutor, err := r.Query().Tutors(ctx, []string{link.TutorMail}, nil)
	room, err := r.Query().Rooms(ctx, []string{link.RoomNumber}, int(link.BuildingID))
	if err != nil {
		return "", err
	}

	mail := email.Email{
		Subject: fmt.Sprintf("%s: %s",
			os.Getenv("EMAIL_ASSIGNMENTS_SUBJECT"), event[0].Title),
		Intros: []string{os.Getenv("EMAIL_ASSIGNMENTS_INTRO")},
		Outros: []string{os.Getenv("EMAIL_ASSIGNMENTS_OUTRO")},
	}

	roomNumber := room[0].Number
	if room[0].Name == "" {
		roomNumber = fmt.Sprintf("%s (%s)",
			room[0].Name, room[0].Number)
	}

	mail.Dictionary = []hermes.Entry{
		{Key: os.Getenv("EMAIL_ASSIGNMENTS_EVENT_TITLE"),
			Value: event[0].Title},
		{Key: os.Getenv("EMAIL_ASSIGNMENTS_DATE_TITLE"),
			Value: event[0].From.Format("02.01.2006")},
		{Key: os.Getenv("EMAIL_ASSIGNMENTS_TIME_TITLE"),
			Value: fmt.Sprintf("%s - %s",
				event[0].From.Format("15:04"), event[0].To.Format("15:04"))},
		{Key: os.Getenv("EMAIL_ASSIGNMENTS_ROOM_TITLE"),
			Value: roomNumber},
		{Key: os.Getenv("EMAIL_ASSIGNMENTS_BUILDING_TITLE"),
			Value: fmt.Sprintf("%s, %s %s, %s, %s",
				room[0].Building.Name,
				room[0].Building.Street, room[0].Building.Number,
				strconv.Itoa(int(room[0].Building.Zip)), room[0].Building.City)}}

	if err := email.Send(tutor[0].User, mail); err != nil {
		return "", err
	}

	return "Successfully linked tutor to event and room", nil
}

// UnassignTutorFromEvent is the resolver for the unassignTutorFromEvent field.
func (r *mutationResolver) UnassignTutorFromEvent(ctx context.Context, link models.EventToTutor) (string, error) {
	if _, err := r.DB.NewDelete().
		Model(&link).
		Exec(ctx); err != nil {
		return "", err
	}

	return "Successfully unassigned tutor from event", nil
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
		Relation("EventsAssigned").
		Relation("EventsAvailable")

	if eventID != nil {
		query = query.Where("event_id = ?", *eventID)
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
func (r *queryResolver) Events(ctx context.Context, id []int, topic []string, typeArg []string, needsTutors *bool, all *bool, tutorsAssigned []string, tutorsAvailable []string) ([]*models.Event, error) {
	var events []*models.Event

	query := r.DB.NewSelect().
		Model(&events).
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

	if typeArg != nil {
		query = query.Where("type IN (?)", bun.In(typeArg))
	}

	if all == nil || *all == false {
		query = query.Where(`"to" >= ?`, time.Now())
	}

	if tutorsAssigned != nil {
		query = query.
			Join("JOIN event_to_tutors AS ett ON ett.event_id = e.id").
			Where("ett.tutor_mail IN (?)", bun.In(tutorsAssigned))
	}

	if tutorsAvailable != nil {
		query = query.
			Join("JOIN tutor_to_events AS tte ON tte.event_id = e.id").
			Where("tte.tutor_mail IN (?)", bun.In(tutorsAvailable))
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
		query = query.Where("r.number IN (?)", bun.In(number))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return rooms, nil
}

// Labels is the resolver for the labels field.
func (r *queryResolver) Labels(ctx context.Context, name []string, kind []model.LabelKind) ([]*models.Label, error) {
	var labels []*models.Label

	query := r.DB.NewSelect().
		Model(&labels)

	if name != nil {
		query = query.Where("name IN (?)", bun.In(name))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return labels, nil
}

// Capacity is the resolver for the capacity field.
func (r *roomResolver) Capacity(ctx context.Context, obj *models.Room) (*int, error) {
	capacity := int(obj.Capacity)
	return &capacity, nil
}

// Floor is the resolver for the floor field.
func (r *roomResolver) Floor(ctx context.Context, obj *models.Room) (*int, error) {
	floor := int(obj.Floor)
	return &floor, nil
}

// Answers is the resolver for the answers field.
func (r *studentResolver) Answers(ctx context.Context, obj *models.Student) ([]string, error) {
	panic(fmt.Errorf("not implemented: Answers - answers"))
}

// Score is the resolver for the score field.
func (r *studentResolver) Score(ctx context.Context, obj *models.Student) (*int, error) {
	panic(fmt.Errorf("not implemented: Score - score"))
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

// Kind is the resolver for the kind field.
func (r *newLabelResolver) Kind(ctx context.Context, obj *models.Label, data model.LabelKind) error {
	obj.Kind = data.String()
	return nil
}

// Capacity is the resolver for the capacity field.
func (r *newRoomResolver) Capacity(ctx context.Context, obj *models.Room, data *int) error {
	obj.Capacity = int16(*data)
	return nil
}

// Floor is the resolver for the floor field.
func (r *newRoomResolver) Floor(ctx context.Context, obj *models.Room, data *int) error {
	obj.Floor = int8(*data)
	return nil
}

// EventsAvailable is the resolver for the eventsAvailable field.
func (r *newTutorResolver) EventsAvailable(ctx context.Context, obj *models.Tutor, data []int) error {
	obj.SessionID = rand.Int31n(9999999-1000000+1) + 1000000
	if _, err := r.DB.NewInsert().
		Model(obj).
		Exec(ctx); err != nil {
		return err
	}

	var tutorToEventRelations []*models.TutorToEvent
	for _, eventId := range data {
		tutorToEventRelation := &models.TutorToEvent{
			TutorMail: obj.Mail,
			EventID:   int32(eventId),
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

// Room returns RoomResolver implementation.
func (r *Resolver) Room() RoomResolver { return &roomResolver{r} }

// Student returns StudentResolver implementation.
func (r *Resolver) Student() StudentResolver { return &studentResolver{r} }

// NewEvent returns NewEventResolver implementation.
func (r *Resolver) NewEvent() NewEventResolver { return &newEventResolver{r} }

// NewLabel returns NewLabelResolver implementation.
func (r *Resolver) NewLabel() NewLabelResolver { return &newLabelResolver{r} }

// NewRoom returns NewRoomResolver implementation.
func (r *Resolver) NewRoom() NewRoomResolver { return &newRoomResolver{r} }

// NewTutor returns NewTutorResolver implementation.
func (r *Resolver) NewTutor() NewTutorResolver { return &newTutorResolver{r} }

type eventResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type roomResolver struct{ *Resolver }
type studentResolver struct{ *Resolver }
type newEventResolver struct{ *Resolver }
type newLabelResolver struct{ *Resolver }
type newRoomResolver struct{ *Resolver }
type newTutorResolver struct{ *Resolver }
