package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/email"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/password"
	hermes "github.com/matcornic/hermes/v2"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

// Points is the resolver for the points field.
func (r *answerResolver) Points(ctx context.Context, obj *models.Answer) (int, error) {
	return int(obj.Points), nil
}

// Score is the resolver for the score field.
func (r *applicationResolver) Score(ctx context.Context, obj *models.Application) (int, error) {
	return int(obj.Score), nil
}

// Responses is the resolver for the responses field.
func (r *applicationResolver) Responses(ctx context.Context, obj *models.Application) ([]*model.QuestionAnswersPair, error) {
	form, err := r.Query().Forms(ctx, []int{int(obj.EventID)})
	if err != nil {
		return nil, err
	}

	qas := []*model.QuestionAnswersPair{}

	for _, question := range form[0].Questions {
		var aqs []*models.ApplicationToQuestion
		if err := r.DB.NewSelect().
			Model(&aqs).
			Relation("Answer").
			Where(`"aq"."question_id" = ?`, question.ID).
			Scan(ctx); err != nil {
			return nil, err
		}

		avs := []*model.AnswerValuePair{}
		for _, answer := range aqs {
			av := &model.AnswerValuePair{
				Answer: answer.Answer,
				Value:  &answer.Value,
			}

			avs = append(avs, av)
		}

		qa := &model.QuestionAnswersPair{
			Question: question,
			Answers:  avs,
		}

		qas = append(qas, qa)
	}

	return qas, nil
}

// TutorsAssigned is the resolver for the tutorsAssigned field.
func (r *eventResolver) TutorsAssigned(ctx context.Context, obj *models.Event) ([]*model.EventTutorRoomPair, error) {
	var eventToTutorRelations []*models.EventToUserAssignment
	if err := r.DB.NewSelect().
		Model(&eventToTutorRelations).
		Relation("Room").
		Relation("Room.Building").
		Relation("User").
		Where("event_id = ?", obj.ID).
		Scan(ctx); err != nil {
		return nil, err
	}

	roomMap := make(map[string]*model.EventTutorRoomPair)
	for _, eventToTutorRelation := range eventToTutorRelations {
		roomKey := eventToTutorRelation.Room.Number +
			strconv.Itoa(int(eventToTutorRelation.Room.BuildingID))
		if room, exists := roomMap[roomKey]; exists {
			room.Tutors = append(room.Tutors, eventToTutorRelation.User)
		} else {
			registrationsCount, err := r.DB.NewSelect().
				Model((*models.UserToEventRegistration)(nil)).
				Where("event_id = ?", obj.ID).
				Where("room_number = ?", eventToTutorRelation.Room.Number).
				Where("building_id = ?", eventToTutorRelation.BuildingID).
				Count(ctx)

			if err != nil {
				return nil, err
			}

			roomMap[roomKey] = &model.EventTutorRoomPair{
				Tutors:        []*models.User{eventToTutorRelation.User},
				Room:          eventToTutorRelation.Room,
				Registrations: registrationsCount,
			}
		}
	}

	var tutorRoomPairs []*model.EventTutorRoomPair
	for _, tutorRoomPair := range roomMap {
		tutorRoomPairs = append(tutorRoomPairs, tutorRoomPair)
	}

	return tutorRoomPairs, nil
}

// AddUser is the resolver for the addUser field.
func (r *mutationResolver) AddUser(ctx context.Context, user models.User) (*models.User, error) {
	sessionID, err := password.GenerateSalt(8)
	if err != nil {
		return nil, fmt.Errorf("error while generating sessionID for %s: %s", user.Mail, err)
	}

	user.SessionID = sessionID

	if user.Password != "" {
		passwordSalt, err := password.GenerateSalt(16)
		if err != nil {
			return nil, err
		}

		user.Salt = passwordSalt

		password, err := password.Hash(user.Password, passwordSalt)
		if err != nil {
			return nil, err
		}

		user.Password = password
	}

	if _, err := r.DB.NewInsert().
		Model(&user).
		Exec(ctx); err != nil {
		return nil, err
	}

	m := r.MailConfig.Confirmation

	m.Actions[0].Button.Link = fmt.Sprintf("%s/confirm/%s",
		os.Getenv("PUBLIC_URL"), user.SessionID)

	if err := email.Send(user, m, r.MailConfig); err != nil {
		log.Error("failed to send email: ", err)
	}

	return &user, nil
}

// UpdateUser is the resolver for the updateUser field.
func (r *mutationResolver) UpdateUser(ctx context.Context, user models.User) (*models.User, error) {
	if _, err := r.DB.NewUpdate().
		Model(&user).
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	return &user, nil
}

// DeleteUser is the resolver for the deleteUser field.
func (r *mutationResolver) DeleteUser(ctx context.Context, mail []string) (int, error) {
	res, err := r.DB.NewDelete().
		Model((*models.User)(nil)).
		Where("mail IN (?)", bun.In(mail)).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	rowsAffected, _ := res.RowsAffected()
	return int(rowsAffected), nil
}

// AddTutor is the resolver for the addTutor field.
func (r *mutationResolver) AddTutor(ctx context.Context, tutor models.User, availability model.NewUserToEventAvailability) (*models.User, error) {
	if _, err := r.Mutation().AddUser(ctx, tutor); err != nil {
		return nil, err
	}

	user, err := r.Mutation().AddTutorAvailabilityForEvent(ctx, availability)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// AddStudent is the resolver for the addStudent field.
func (r *mutationResolver) AddStudent(ctx context.Context, student models.User, application model.NewUserToEventApplication) (*models.User, error) {
	if _, err := r.Mutation().AddUser(ctx, student); err != nil {
		return nil, err
	}

	newUser, err := r.Mutation().AddStudentApplicationForEvent(ctx, application)
	if err != nil {
		return nil, err
	}

	return newUser, nil
}

// AddEvent is the resolver for the addEvent field.
func (r *mutationResolver) AddEvent(ctx context.Context, event models.Event) (*models.Event, error) {
	if _, err := r.DB.NewInsert().
		Model(&event).
		Exec(ctx); err != nil {
		return nil, err
	}

	return &event, nil
}

// UpdateEvent is the resolver for the updateEvent field.
func (r *mutationResolver) UpdateEvent(ctx context.Context, id int, event models.Event) (*models.Event, error) {
	if _, err := r.DB.NewUpdate().
		Model(&event).
		Where("id = ?", id).
		Exec(ctx); err != nil {
		return nil, err
	}

	updatedEvent, err := r.Query().Events(ctx, []int{id}, nil, nil, nil, nil, nil, nil)
	if err != nil {
		return nil, err
	}

	return updatedEvent[0], nil
}

// DeleteEvent is the resolver for the deleteEvent field.
func (r *mutationResolver) DeleteEvent(ctx context.Context, id []int) (int, error) {
	res, err := r.DB.NewDelete().
		Model((*models.Event)(nil)).
		Where("id IN (?)", bun.In(id)).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	rowsAffected, _ := res.RowsAffected()
	return int(rowsAffected), nil
}

// AddBuilding is the resolver for the addBuilding field.
func (r *mutationResolver) AddBuilding(ctx context.Context, building models.Building) (*models.Building, error) {
	if _, err := r.DB.NewInsert().
		Model(&building).
		Exec(ctx); err != nil {
		return nil, err
	}

	return &building, nil
}

// UpdateBuilding is the resolver for the updateBuilding field.
func (r *mutationResolver) UpdateBuilding(ctx context.Context, id int, building models.Building) (*models.Building, error) {
	if _, err := r.DB.NewUpdate().
		Model(&building).
		Where("id = ?", id).
		Exec(ctx); err != nil {
		return nil, err
	}

	updatedBuilding, err := r.Query().Buildings(ctx, []int{id})
	if err != nil {
		return nil, err
	}

	return updatedBuilding[0], nil
}

// DeleteBuilding is the resolver for the deleteBuilding field.
func (r *mutationResolver) DeleteBuilding(ctx context.Context, id []int) (int, error) {
	res, err := r.DB.NewDelete().
		Model((*models.Building)(nil)).
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	rowsAffected, _ := res.RowsAffected()
	return int(rowsAffected), err
}

// AddRoom is the resolver for the addRoom field.
func (r *mutationResolver) AddRoom(ctx context.Context, room models.Room) (*models.Room, error) {
	if _, err := r.DB.NewInsert().
		Model(&room).
		Exec(ctx); err != nil {
		return nil, err
	}

	return &room, nil
}

// UpdateRoom is the resolver for the updateRoom field.
func (r *mutationResolver) UpdateRoom(ctx context.Context, room models.Room) (*models.Room, error) {
	if _, err := r.DB.NewUpdate().
		Model(&room).
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	updatedRoom, err := r.Query().Rooms(ctx, []string{room.Number}, int(room.BuildingID))
	if err != nil {
		return nil, err
	}

	return updatedRoom[0], nil
}

// DeleteRoom is the resolver for the deleteRoom field.
func (r *mutationResolver) DeleteRoom(ctx context.Context, number []string, buildingID int) (int, error) {
	res, err := r.DB.NewDelete().
		Model((*models.Room)(nil)).
		Where("number = ?", number).
		Where("building_id = ?", buildingID).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	rowsAffected, _ := res.RowsAffected()
	return int(rowsAffected), nil
}

// AddLabel is the resolver for the addLabel field.
func (r *mutationResolver) AddLabel(ctx context.Context, label models.Label) (*models.Label, error) {
	if label.Color == "" {
		label.Color = "#D1D1D1"
	}

	if _, err := r.DB.NewInsert().
		Model(&label).
		Exec(ctx); err != nil {
		return nil, err
	}

	return &label, nil
}

// UpdateLabel is the resolver for the updateLabel field.
func (r *mutationResolver) UpdateLabel(ctx context.Context, label models.Label) (*models.Label, error) {
	if _, err := r.DB.NewUpdate().
		Model(&label).
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	updatedLabel, err := r.Query().Labels(ctx, []string{label.Name}, nil, nil)
	if err != nil {
		return nil, err
	}

	return updatedLabel[0], nil
}

// DeleteLabel is the resolver for the deleteLabel field.
func (r *mutationResolver) DeleteLabel(ctx context.Context, name []string) (int, error) {
	res, err := r.DB.NewDelete().
		Model((*models.Label)(nil)).
		Where("name = ?", name).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	rowsAffected, _ := res.RowsAffected()
	return int(rowsAffected), err
}

// AddSetting is the resolver for the addSetting field.
func (r *mutationResolver) AddSetting(ctx context.Context, setting models.Setting) (*models.Setting, error) {
	if setting.Type == model.ScalarTypeColor.String() {
		hexColorPattern := `^#(?:[0-9a-fA-F]{3,4}){1,2}$`
		if match, _ := regexp.MatchString(hexColorPattern, setting.Value); !match {
			return nil, fmt.Errorf("unable to parse color: %s", setting.Value)
		}
	}

	if _, err := r.DB.NewInsert().
		Model(&setting).
		Exec(ctx); err != nil {
		return nil, err
	}

	return &setting, nil
}

// UpdateSetting is the resolver for the updateSetting field.
func (r *mutationResolver) UpdateSetting(ctx context.Context, setting models.Setting) (*models.Setting, error) {
	if _, err := r.DB.NewUpdate().
		Model(&setting).
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	updatedSetting, err := r.Query().Settings(ctx, []string{setting.Key}, nil)
	if err != nil {
		return nil, err
	}

	return updatedSetting[0], nil
}

// DeleteSetting is the resolver for the deleteSetting field.
func (r *mutationResolver) DeleteSetting(ctx context.Context, key []string) (int, error) {
	res, err := r.DB.NewDelete().
		Model((*models.Setting)(nil)).
		Where("key = ?", key).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	rowsAffected, _ := res.RowsAffected()
	return int(rowsAffected), nil
}

// AddForm is the resolver for the addForm field.
func (r *mutationResolver) AddForm(ctx context.Context, form models.Form) (*models.Form, error) {
	if _, err := r.DB.NewInsert().
		Model(&form).
		Exec(ctx); err != nil {
		return nil, err
	}

	return &form, nil
}

// UpdateForm is the resolver for the updateForm field.
func (r *mutationResolver) UpdateForm(ctx context.Context, id int, form models.Form) (*models.Form, error) {
	if _, err := r.DB.NewUpdate().
		Model(&form).
		Exec(ctx); err != nil {
		return nil, err
	}

	updatedForm, err := r.Query().Forms(ctx, []int{id})
	if err != nil {
		return nil, err
	}

	return updatedForm[0], nil
}

// DeleteForm is the resolver for the deleteForm field.
func (r *mutationResolver) DeleteForm(ctx context.Context, id []int) (int, error) {
	res, err := r.DB.NewDelete().
		Model((*models.Form)(nil)).
		Where("id IN (?)", bun.In(id)).
		Exec(ctx)
	if err != nil {
		return 0, err
	}

	rowsAffected, _ := res.RowsAffected()
	return int(rowsAffected), nil
}

// AddEventAssignmentForTutor is the resolver for the addEventAssignmentForTutor field.
func (r *mutationResolver) AddEventAssignmentForTutor(ctx context.Context, assignment models.EventToUserAssignment) (*models.Event, error) {
	if _, err := r.DB.NewInsert().
		Model(&assignment).
		Exec(ctx); err != nil {
		return nil, err
	}

	if err := r.DB.NewSelect().
		Model(&assignment).
		Relation("Event").
		Relation("Room").
		Relation("Building").
		Relation("User").
		WherePK().
		Scan(ctx); err != nil {
		return nil, err
	}

	m := r.MailConfig.Assignment

	m.Subject = fmt.Sprintf("%s: %s",
		r.Settings["email-assignment-subject"], assignment.Event.Title)

	roomNumber := assignment.Room.Number
	if assignment.Room.Name != "" {
		roomNumber = fmt.Sprintf("%s (%s)",
			assignment.Room.Name, assignment.Room.Number)
	}

	m.Dictionary = []hermes.Entry{
		{Key: r.Settings["email-assignment-event-title"],
			Value: assignment.Event.Title},
		{Key: r.Settings["email-assignment-date-title"],
			Value: assignment.Event.From.Format("02.01.2006")},
		{Key: r.Settings["email-assignment-time-title"],
			Value: fmt.Sprintf("%s - %s",
				assignment.Event.From.Format("15:04"), assignment.Event.To.Format("15:04"))},
		{Key: r.Settings["email-assignment-room-title"],
			Value: roomNumber},
		{Key: r.Settings["email-assignment-building-title"],
			Value: fmt.Sprintf("%s, %s %s, %s, %s",
				assignment.Building.Name,
				assignment.Building.Street, assignment.Building.Number,
				assignment.Building.Zip, assignment.Building.City)}}

	if err := email.Send(*assignment.User, m, r.MailConfig); err != nil {
		return nil, err
	}

	return assignment.Event, nil
}

// DeleteEventAssignmentForTutor is the resolver for the deleteEventAssignmentForTutor field.
func (r *mutationResolver) DeleteEventAssignmentForTutor(ctx context.Context, assignment models.EventToUserAssignment) (*models.Event, error) {
	res, err := r.DB.NewDelete().
		Model(&assignment).
		WherePK().
		Exec(ctx)
	if err != nil {
		return nil, err
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return nil, fmt.Errorf("user was not assigned to this event")
	}

	eventAvailibility := model.NewUserToEventAvailability{
		UserMail: assignment.UserMail,
		EventID:  []int{int(assignment.EventID)},
	}

	if _, err := r.Mutation().AddTutorAvailabilityForEvent(ctx, eventAvailibility); err != nil {
		return nil, err
	}

	event, err := r.Query().Events(ctx, []int{int(assignment.EventID)}, nil, nil, nil, nil, nil, nil)
	if err != nil {
		return nil, err
	}

	return event[0], nil
}

// AddTutorAvailabilityForEvent is the resolver for the addTutorAvailabilityForEvent field.
func (r *mutationResolver) AddTutorAvailabilityForEvent(ctx context.Context, availability model.NewUserToEventAvailability) (*models.User, error) {
	availabilitys := []models.UserToEventAvailability{}
	for _, eID := range availability.EventID {
		a := models.UserToEventAvailability{
			UserMail: availability.UserMail,
			EventID:  int32(eID),
		}

		availabilitys = append(availabilitys, a)
	}

	if _, err := r.DB.NewInsert().
		Model(&availabilitys).
		Exec(ctx); err != nil {
		return nil, err
	}

	if err := r.DB.NewSelect().
		Model(&availabilitys).
		Relation("Event").
		WherePK().
		Scan(ctx); err != nil {
		return nil, err
	}

	m := r.MailConfig.Availability

	m.Table.Data = *new([][]hermes.Entry)
	for _, a := range availabilitys {
		e := []hermes.Entry{
			{Key: r.Settings["email-assignment-event-title"], Value: a.Event.Title},
			{Key: r.Settings["email-assignment-date-title"], Value: a.Event.From.Format("02.01")},
			{Key: r.Settings["email-assignment-kind-title"], Value: a.Event.TypeName}}
		m.Table.Data = append(m.Table.Data, e)
	}

	user, err := r.Query().Users(ctx, []string{availability.UserMail}, nil)
	if err != nil {
		return nil, err
	}

	if err := email.Send(*user[0], m, r.MailConfig); err != nil {
		return nil, err
	}

	return user[0], nil
}

// DeleteTutorAvailabilityForEvent is the resolver for the deleteTutorAvailabilityForEvent field.
func (r *mutationResolver) DeleteTutorAvailabilityForEvent(ctx context.Context, availability model.NewUserToEventAvailability) (*models.User, error) {
	if _, err := r.DB.NewDelete().
		Model((*models.UserToEventAvailability)(nil)).
		Where("user_mail = ?", availability.UserMail).
		Where("event_id IN (?)", bun.In(availability.EventID)).
		Exec(ctx); err != nil {
		return nil, err
	}

	user, err := r.Query().Users(ctx, []string{availability.UserMail}, nil)
	if err != nil {
		return nil, err
	}

	return user[0], nil
}

// AddRoomAvailabilityForEvent is the resolver for the addRoomAvailabilityForEvent field.
func (r *mutationResolver) AddRoomAvailabilityForEvent(ctx context.Context, availability models.RoomToEventAvailability) (*models.Room, error) {
	if _, err := r.DB.NewInsert().
		Model(&availability).
		Exec(ctx); err != nil {
		return nil, err
	}

	room, err := r.Query().Rooms(ctx, []string{availability.RoomNumber}, int(availability.BuildingID))
	if err != nil {
		return nil, err
	}

	return room[0], nil
}

// UpdateRoomForTutorial is the resolver for the updateRoomForTutorial field.
func (r *mutationResolver) UpdateRoomForTutorial(ctx context.Context, newRoomNumber string, newBuildingID int, eventID int, oldRoomNumber string, oldBuildingID int) (*models.Event, error) {
	panic(fmt.Errorf("not implemented: UpdateRoomForTutorial - updateRoomForTutorial"))
}

// DeleteRoomAvailabilityForEvent is the resolver for the deleteRoomAvailabilityForEvent field.
func (r *mutationResolver) DeleteRoomAvailabilityForEvent(ctx context.Context, availability models.RoomToEventAvailability) (*models.Room, error) {
	if _, err := r.DB.NewDelete().
		Model(&availability).
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	room, err := r.Query().Rooms(ctx, []string{availability.RoomNumber}, int(availability.BuildingID))
	if err != nil {
		return nil, err
	}

	return room[0], nil
}

// AddStudentRegistrationForEvent is the resolver for the addStudentRegistrationForEvent field.
func (r *mutationResolver) AddStudentRegistrationForEvent(ctx context.Context, registration models.UserToEventRegistration) (*models.UserToEventRegistration, error) {
	if _, err := r.DB.NewInsert().
		Model(&registration).
		Exec(ctx); err != nil {
		return nil, err
	}

	reg, err := r.Query().Registrations(ctx, registration.UserMail)
	if err != nil {
		return nil, err
	}

	return reg[0], nil
}

// DeleteStudentRegistrationForEvent is the resolver for the deleteStudentRegistrationForEvent field.
func (r *mutationResolver) DeleteStudentRegistrationForEvent(ctx context.Context, registration models.UserToEventRegistration) (*models.User, error) {
	if _, err := r.DB.NewDelete().
		Model(&registration).
		WherePK().
		Exec(ctx); err != nil {
		return nil, err
	}

	user, err := r.Query().Users(ctx, []string{registration.UserMail}, nil)
	if err != nil {
		return nil, err
	}

	return user[0], nil
}

// AddStudentApplicationForEvent is the resolver for the addStudentApplicationForEvent field.
func (r *mutationResolver) AddStudentApplicationForEvent(ctx context.Context, application model.NewUserToEventApplication) (*models.User, error) {
	score := 0

	aqs := []models.ApplicationToQuestion{}
	for _, a := range application.Answers {
		var points int

		aq := &models.ApplicationToQuestion{
			StudentMail: application.UserMail,
			EventID:     int32(application.EventID),
			QuestionID:  int32(a.QuestionID),
		}

		if a.AnswerID != nil {
			aq.AnswerID = int32(*a.AnswerID)
			if err := r.DB.NewSelect().
				Model((*models.Answer)(nil)).
				Column("points").
				Where("id = ?", *a.AnswerID).
				Scan(ctx, &points); err != nil {
				return nil, err
			}
		} else {
			p, err := strconv.Atoi(*a.Value)
			if err != nil {
				return nil, fmt.Errorf("when no answer id provided, value must be a number")
			}

			aq.Value = *a.Value
			points = p
		}

		aqs = append(aqs, *aq)

		score += points
	}

	a := &models.Application{
		EventID:     int32(application.EventID),
		StudentMail: application.UserMail,
		Score:       int16(score),
	}

	if _, err := r.DB.NewInsert().
		Model(a).
		Exec(ctx); err != nil {
		return nil, err
	}

	if _, err := r.DB.NewInsert().
		Model(&aqs).
		Exec(ctx); err != nil {
		return nil, err
	}

	user, err := r.Query().Users(ctx, []string{application.UserMail}, nil)
	if err != nil {
		return nil, err
	}

	return user[0], nil
}

// DeleteStudentApplicationForEvent is the resolver for the deleteStudentApplicationForEvent field.
func (r *mutationResolver) DeleteStudentApplicationForEvent(ctx context.Context, mail string, eventID int) (*models.User, error) {
	if _, err := r.DB.NewDelete().
		Model((*models.Application)(nil)).
		Where("student_mail = ?", mail).
		Where("event_id = ?", mail).
		Exec(ctx); err != nil {
		return nil, err
	}

	user, err := r.Query().Users(ctx, []string{mail}, nil)
	if err != nil {
		return nil, err
	}

	return user[0], nil
}

// Events is the resolver for the events field.
func (r *queryResolver) Events(ctx context.Context, id []int, umbrellaID []int, topic []string, typeArg []string, needsTutors *bool, onlyFuture *bool, userMail []string) ([]*models.Event, error) {
	var events []*models.Event

	query := r.DB.NewSelect().
		Model(&events).
		Relation("Topic").
		Relation("Type").
		Relation("TutorsAssigned").
		Relation("TutorsAvailable").
		Relation("RoomsAvailable").
		Relation("RoomsAvailable.Building").
		Relation("Umbrella").
		Where(`"e"."umbrella_id" IS NOT NULL`).
		Order("ASC")

	if umbrellaID != nil {
		query = query.Where(`"e"."umbrella_id" IN (?)`, bun.In(umbrellaID))
	}

	if typeArg != nil {
		query = query.Where(`"e"."type_name" IN (?)`, bun.In(typeArg))
	}

	if topic != nil {
		query = query.Where(`"e"."topic_name" IN (?)`, bun.In(topic))
	}

	if needsTutors != nil {
		query = query.Where(`"e"."needs_tutors" = ?`, *needsTutors)
	}

	if id != nil {
		query = query.Where(`"e"."id" IN (?)`, bun.In(id))
	}

	if onlyFuture != nil && *onlyFuture == true {
		query = query.Where(`"umbrella"."to" >= ?`, time.Now())
	}

	if userMail != nil {
		query = query.
			Join("JOIN event_to_user_assignments AS eta ON eta.event_id = e.id").
			Join("LEFT JOIN user_to_event_availability AS uea ON uea.event_id = e.id").
			Where("uea.tutor_mail IN (?) OR eta.tutor_mail IN (?)", bun.In(userMail), bun.In(userMail))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return events, nil
}

// Umbrellas is the resolver for the umbrellas field.
func (r *queryResolver) Umbrellas(ctx context.Context, id []int, onlyFuture *bool) ([]*models.Event, error) {
	var umbrellas []*models.Event
	query := r.DB.NewSelect().
		Model(&umbrellas).
		Relation("Topic").
		Relation("RegistrationForm").
		Where("umbrella_id IS NULL").
		Order("from ASC")

	if id != nil {
		query = query.Where("id IN (?)", bun.In(id))
	}

	if onlyFuture != nil && *onlyFuture == true {
		query = query.Where(`"to" >= ?`, time.Now())
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return umbrellas, nil
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
func (r *queryResolver) Labels(ctx context.Context, name []string, kind []model.LabelKind, umbrellaID []int) ([]*models.Label, error) {
	var labels []*models.Label

	query := r.DB.NewSelect().
		Model(&labels)

	if name != nil {
		query = query.Where("name IN (?)", bun.In(name))
	}

	if kind != nil {
		var kinds []string
		for _, k := range kind {
			kinds = append(kinds, k.String())
		}

		query = query.Where("kind IN (?)", bun.In(kinds))
	}

	if umbrellaID != nil {
		query = query.
			Where("EXISTS (SELECT 1 FROM events e WHERE e.umbrella_id IN (?) AND (e.topic_name = l.name OR e.type_name = l.name))",
				bun.In(umbrellaID))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return labels, nil
}

// Settings is the resolver for the settings field.
func (r *queryResolver) Settings(ctx context.Context, key []string, typeArg []model.ScalarType) ([]*models.Setting, error) {
	var settings []*models.Setting

	query := r.DB.NewSelect().
		Model(&settings)

	if key != nil {
		query = query.Where("key IN (?)", bun.In(key))
	}

	if typeArg != nil {
		var types []string
		for _, t := range typeArg {
			types = append(types, t.String())
		}

		query = query.Where("type IN (?)", bun.In(types))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return settings, nil
}

// Users is the resolver for the users field.
func (r *queryResolver) Users(ctx context.Context, mail []string, sessionID []string) ([]*models.User, error) {
	var users []*models.User

	query := r.DB.NewSelect().
		Model(&users).
		Relation("EventsAssigned").
		Relation("EventsAvailable").
		Relation("EventsRegistered").
		Relation("Applications")

	if mail != nil {
		query = query.Where("mail IN (?)", bun.In(mail))
	}

	if sessionID != nil {
		query = query.Where("session_id IN (?)", bun.In(sessionID))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return users, nil
}

// Forms is the resolver for the forms field.
func (r *queryResolver) Forms(ctx context.Context, id []int) ([]*models.Form, error) {
	var forms []*models.Form

	query := r.DB.NewSelect().
		Model(&forms).
		Relation("Questions").
		Relation("Questions.Answers")

	if id != nil {
		query = query.Where("event_id IN (?)", bun.In(id))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return forms, nil
}

// Applications is the resolver for the applications field.
func (r *queryResolver) Applications(ctx context.Context, eventID *int, studentMail []string) ([]*models.Application, error) {
	var applications []*models.Application

	query := r.DB.NewSelect().
		Model(&applications).
		Relation("Event").
		Relation("Student").
		Relation("Form")

	if eventID != nil {
		query = query.Where("event_id = ?", *eventID)
	}

	if studentMail != nil {
		query = query.Where("student_mail IN (?)", bun.In(studentMail))
	}

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return applications, nil
}

// Registrations is the resolver for the registrations field.
func (r *queryResolver) Registrations(ctx context.Context, studentMail string) ([]*models.UserToEventRegistration, error) {
	var registrations []*models.UserToEventRegistration

	query := r.DB.NewSelect().
		Model(&registrations).
		Relation("Event").
		Relation("Room").
		Relation("Room.Building").
		Where("user_mail = ?", studentMail)

	if err := query.Scan(ctx); err != nil {
		return nil, err
	}

	return registrations, nil
}

// Login is the resolver for the login field.
func (r *queryResolver) Login(ctx context.Context, credentials *model.EmailPassword, sessionID *string) (*model.AuthPayload, error) {
	var email []string
	var sID []string
	if sessionID != nil {
		sID = append(sID, *sessionID)
	} else {
		email = append(email, credentials.Email)
	}

	user, err := r.Query().Users(ctx, email, sID)
	if err != nil || len(user) == 0 {
		return nil, err
	}

	if credentials != nil {
		if err := password.VerifyPassword(user[0].Password, credentials.Password, user[0].Salt); err != nil {
			return nil, err
		}
	}

	payload := &model.AuthPayload{
		SessionID: user[0].SessionID,
		User:      user[0],
	}

	return payload, nil
}

// Type is the resolver for the type field.
func (r *questionResolver) Type(ctx context.Context, obj *models.Question) (model.QuestionType, error) {
	for _, t := range model.AllQuestionType {
		if t.String() == obj.Type {
			return t, nil
		}
	}

	return model.QuestionTypeText, fmt.Errorf("%s is not a valid question type", obj.Type)
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

// Type is the resolver for the type field.
func (r *settingResolver) Type(ctx context.Context, obj *models.Setting) (model.ScalarType, error) {
	for _, t := range model.AllScalarType {
		if t.String() == obj.Type {
			return t, nil
		}
	}

	return model.ScalarTypeString, fmt.Errorf("unable to resolve type: %s", obj.Type)
}

// Points is the resolver for the points field.
func (r *newAnswerResolver) Points(ctx context.Context, obj *models.Answer, data int) error {
	obj.Points = int8(data)
	return nil
}

// Kind is the resolver for the kind field.
func (r *newLabelResolver) Kind(ctx context.Context, obj *models.Label, data model.LabelKind) error {
	obj.Kind = data.String()
	return nil
}

// Type is the resolver for the type field.
func (r *newQuestionResolver) Type(ctx context.Context, obj *models.Question, data model.QuestionType) error {
	obj.Type = data.String()
	return nil
}

// Capacity is the resolver for the capacity field.
func (r *newRoomResolver) Capacity(ctx context.Context, obj *models.Room, data int) error {
	obj.Capacity = int16(data)
	return nil
}

// Floor is the resolver for the floor field.
func (r *newRoomResolver) Floor(ctx context.Context, obj *models.Room, data *int) error {
	obj.Floor = int8(*data)
	return nil
}

// Type is the resolver for the type field.
func (r *newSettingResolver) Type(ctx context.Context, obj *models.Setting, data *model.ScalarType) error {
	obj.Type = data.String()
	return nil
}

// Answer returns AnswerResolver implementation.
func (r *Resolver) Answer() AnswerResolver { return &answerResolver{r} }

// Application returns ApplicationResolver implementation.
func (r *Resolver) Application() ApplicationResolver { return &applicationResolver{r} }

// Event returns EventResolver implementation.
func (r *Resolver) Event() EventResolver { return &eventResolver{r} }

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

// Question returns QuestionResolver implementation.
func (r *Resolver) Question() QuestionResolver { return &questionResolver{r} }

// Room returns RoomResolver implementation.
func (r *Resolver) Room() RoomResolver { return &roomResolver{r} }

// Setting returns SettingResolver implementation.
func (r *Resolver) Setting() SettingResolver { return &settingResolver{r} }

// NewAnswer returns NewAnswerResolver implementation.
func (r *Resolver) NewAnswer() NewAnswerResolver { return &newAnswerResolver{r} }

// NewLabel returns NewLabelResolver implementation.
func (r *Resolver) NewLabel() NewLabelResolver { return &newLabelResolver{r} }

// NewQuestion returns NewQuestionResolver implementation.
func (r *Resolver) NewQuestion() NewQuestionResolver { return &newQuestionResolver{r} }

// NewRoom returns NewRoomResolver implementation.
func (r *Resolver) NewRoom() NewRoomResolver { return &newRoomResolver{r} }

// NewSetting returns NewSettingResolver implementation.
func (r *Resolver) NewSetting() NewSettingResolver { return &newSettingResolver{r} }

type answerResolver struct{ *Resolver }
type applicationResolver struct{ *Resolver }
type eventResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type questionResolver struct{ *Resolver }
type roomResolver struct{ *Resolver }
type settingResolver struct{ *Resolver }
type newAnswerResolver struct{ *Resolver }
type newLabelResolver struct{ *Resolver }
type newQuestionResolver struct{ *Resolver }
type newRoomResolver struct{ *Resolver }
type newSettingResolver struct{ *Resolver }
