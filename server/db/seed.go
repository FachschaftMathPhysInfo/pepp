package db

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/auth"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func SeedData(ctx context.Context, db *bun.DB) error {
	password, err := auth.Hash("tutor")
	if err != nil {
		return fmt.Errorf("failed to generate passwords for tutors:", err)
	}
	users := []*models.User{
		{Mail: "tutor1@example.de", Fn: "Tutorin", Sn: "One", Confirmed: utils.BoolPtr(true), Password: password},
		{Mail: "tutor2@example.de", Fn: "Tutor", Sn: "Two", Confirmed: utils.BoolPtr(true), Password: password},
		{Mail: "student1@example.de", Fn: "Student", Sn: "One", Confirmed: utils.BoolPtr(true)},
		{Mail: "student2@example.de", Fn: "Student", Sn: "Two", Confirmed: utils.BoolPtr(true)},
	}
	if err := insertData(ctx, db, (*models.User)(nil), users, "Users"); err != nil {
		return err
	}

	buildings := []*models.Building{{
		Name:      "Mathematikon",
		Street:    "INF",
		Number:    "205",
		City:      "Heidelberg",
		Zip:       "69115",
		Latitude:  49.417493,
		Longitude: 8.675197,
		ZoomLevel: 17,
	}, {
		Name:      "Kirchhoff-Institut für Physik",
		Street:    "INF",
		Number:    "227",
		City:      "Heidelberg",
		Zip:       "69115",
		Latitude:  49.4162501,
		Longitude: 8.6694734,
		ZoomLevel: 17,
	}}
	if err := insertData(ctx, db, (*models.Building)(nil), buildings, "Buildings"); err != nil {
		return err
	}

	rooms := []*models.Room{{
		Number:     "101",
		Name:       "SR 1",
		Capacity:   20,
		Floor:      2,
		BuildingID: 1,
	}, {
		Number:     "2.141",
		Capacity:   35,
		BuildingID: 1,
	}, {
		Number:     "503",
		Name:       "Labor 1",
		Capacity:   30,
		Floor:      5,
		BuildingID: 2,
	}}
	if err := insertData(ctx, db, (*models.Room)(nil), rooms, "Rooms"); err != nil {
		return err
	}

	labels := []*models.Label{
		{Name: "Mathe", Color: "#87cefa", Kind: "TOPIC"},
		{Name: "Informatik", Color: "#FFE31A", Kind: "TOPIC"},
		{Name: "Allgemein", Color: "#5D737E", Kind: "TOPIC"},
		{Name: "Tutorium", Color: "#ABBA7C", Kind: "EVENT_TYPE"},
		{Name: "Vorlesung", Color: "#ffbf00", Kind: "EVENT_TYPE"},
	}
	if err := insertData(ctx, db, (*models.Label)(nil), labels, "Labels"); err != nil {
		return err
	}

	umbrellaID := int32(1)
	umbrellaID2 := int32(2)
	events := []*models.Event{
		{
			Title:       fmt.Sprintf("Vorkurs %s", strconv.Itoa(time.Now().Year())),
			Description: "Lorem Ipsum",
			From:        time.Now().Add(-time.Hour),
			To:          time.Now().Add(3 * (time.Hour * 24)),
		},
		{
			Title:       fmt.Sprintf("Programmiervorkurs %s", strconv.Itoa(time.Now().Year())),
			Description: "Lorem Ipsum",
			From:        time.Now().Add(-time.Hour),
			To:          time.Now().Add(3 * (time.Hour * 24)),
		},
		{
			Title:       "Algorithmen und Datenstrukturen",
			Description: "Lorem Ipsum dolor sit amed",
			TopicName:   "Informatik",
			TypeName:    "Tutorium",
			NeedsTutors: utils.BoolPtr(true),
			From:        time.Now().Add(-time.Hour),
			To:          time.Now().Add(time.Hour),
			UmbrellaID:  &umbrellaID,
		},
		{
			Title:       "Analysis",
			Description: "Lorem Ipsum dolor sit amed",
			TopicName:   "Mathe",
			TypeName:    "Vorlesung",
			NeedsTutors: utils.BoolPtr(true),
			From:        time.Now().Add((24 * time.Hour) * 7),
			To:          time.Now().Add((24*time.Hour)*7 + 2*time.Hour),
			UmbrellaID:  &umbrellaID,
		},
		{
			Title:       "Einführungsveranstaltung",
			Description: "Lorem Ipsum dolor sit amed",
			TopicName:   "Allgemein",
			TypeName:    "Vorlesung",
			NeedsTutors: utils.BoolPtr(true),
			From:        time.Now().Add(-time.Hour),
			To:          time.Now().Add(time.Hour),
			UmbrellaID:  &umbrellaID2,
		},
		{
			Title:       "Lineare Algebra",
			Description: "Lorem Ipsum dolor sit amed",
			TopicName:   "Mathe",
			TypeName:    "Tutorium",
			NeedsTutors: utils.BoolPtr(true),
			From:        time.Now().Add(2 * time.Hour),
			To:          time.Now().Add(3 * time.Hour),
			UmbrellaID:  &umbrellaID,
		}}
	if err := insertData(ctx, db, (*models.Event)(nil), events, "Events"); err != nil {
		return err
	}

	tutorials := []*models.Tutorial{
		{EventID: 3, RoomNumber: "101", BuildingID: 1},
		{EventID: 3, RoomNumber: "2.141", BuildingID: 1},
		{EventID: 5, RoomNumber: "503", BuildingID: 2},
	}
	if err := insertData(ctx, db, (*models.Tutorial)(nil), tutorials, "Tutorials"); err != nil {
		return err
	}

	assignments := []*models.TutorialToUserAssignment{
		{TutorialID: 1, UserID: 1},
		{TutorialID: 1, UserID: 2},
		{TutorialID: 2, UserID: 2},
		{TutorialID: 3, UserID: 2},
	}
	if err := insertData(ctx, db, (*models.TutorialToUserAssignment)(nil), assignments, "Tutorial to User assignments"); err != nil {
		return err
	}

	availabilitys := []*models.UserToEventAvailability{
		{EventID: 3, UserID: 1},
		{EventID: 3, UserID: 2},
		{EventID: 4, UserID: 1},
		{EventID: 5, UserID: 2},
	}
	if err := insertData(ctx, db, (*models.UserToEventAvailability)(nil), availabilitys, "User to Event availabilitys"); err != nil {
		return err
	}

	registrations := []*models.UserToTutorialRegistration{
		{TutorialID: 1, UserID: 3},
		{TutorialID: 2, UserID: 4},
		{TutorialID: 3, UserID: 3},
		{TutorialID: 3, UserID: 4},
	}
	if err := insertData(ctx, db, (*models.UserToTutorialRegistration)(nil), registrations, "User to Tutorial registrations"); err != nil {
		return err
	}

	form := []*models.Form{{
		Title:       "Beispielregistrierung",
		Description: "Lorem Ipsum dolor sit amed",
		EventID:     2,
	}}
	if err := insertData(ctx, db, (*models.Form)(nil), form, "Form"); err != nil {
		return err
	}

	questions := []*models.Question{
		{Title: "Wie viel Programmiererfahrung hast du?", Type: "SCALE", FormID: 2},
		{Title: "Welche der folgenden Konzepte kennst du noch nicht?", Type: "MULTIPLE_CHOICE", Required: false, FormID: 2},
		{Title: "Welchen Studiengang belegst du?", Type: "SINGLE_CHOICE", Required: true, FormID: 2},
	}
	if err := insertData(ctx, db, (*models.Question)(nil), questions, "Questions"); err != nil {
		return err
	}

	answers := []*models.Answer{
		{QuestionID: 1, Title: "Keine", Points: 8},
		{QuestionID: 1, Title: "Ich arbeite an eigenen Projekten", Points: 0},
		{QuestionID: 2, Title: "Variablen", Points: 5},
		{QuestionID: 2, Title: "If-Bedingungen", Points: 4},
		{QuestionID: 2, Title: "For/While-Schleifen", Points: 3},
		{QuestionID: 2, Title: "Klassen", Points: 1},
		{QuestionID: 3, Title: "Informatik", Points: 2},
		{QuestionID: 3, Title: "Mathematik", Points: 1},
		{QuestionID: 3, Title: "Physik", Points: 1},
	}
	if err := insertData(ctx, db, (*models.Answer)(nil), answers, "Answers"); err != nil {
		return err
	}

	url := os.Getenv("PUBLIC_URL")
	if url == "" {
		url = "http://localhost:8080"
	}

	settings := []*models.Setting{
		{Key: "primary-color", Value: "#990000", Type: "COLOR"},
		{Key: "logo-url", Value: fmt.Sprintf("%s/fs-logo-light.png", url), Type: "STRING"},
		{Key: "homepage-url", Value: "https://mathphys.info", Type: "STRING"},
		{Key: "copyright-notice", Value: "Copyright © 2024, Fachschaft MathPhysInfo. All rights reserved.", Type: "STRING"},
		{Key: "email-greeting", Value: "Hey", Type: "STRING"},
		{Key: "email-signature", Value: "Dein", Type: "STRING"},
		{Key: "email-name", Value: "Pepp - Die Vorkursverwaltung", Type: "STRING"},
		{Key: "email-confirm-subject", Value: "Bitte bestätige deine E-Mail Adresse", Type: "STRING"},
		{Key: "email-confirm-intro", Value: "danke für deine Registrierung!", Type: "STRING"},
		{Key: "email-confirm-button-instruction", Value: "Bitte klicke hier, um deine E-Mail Adresse zu bestätigen:", Type: "STRING"},
		{Key: "email-confirm-button-text", Value: "Bestätigen", Type: "STRING"},
		{Key: "email-availability-subject", Value: "Deine Verfügbarkeiten", Type: "STRING"},
		{Key: "email-availability-intro", Value: "du hast dich zu folgenden Veranstaltungen als verfügbar eingetragen:", Type: "STRING"},
		{Key: "email-availability-outro", Value: "Danke! Wir melden uns bei dir.", Type: "STRING"},
		{Key: "email-assignment-subject", Value: "Deine Veranstaltung", Type: "STRING"},
		{Key: "email-assignment-event-title", Value: "Veranstaltung", Type: "STRING"},
		{Key: "email-assignment-kind-title", Value: "Art", Type: "STRING"},
		{Key: "email-assignment-date-title", Value: "Datum", Type: "STRING"},
		{Key: "email-assignment-time-title", Value: "Uhrzeit", Type: "STRING"},
		{Key: "email-assignment-room-title", Value: "Raum", Type: "STRING"},
		{Key: "email-assignment-building-title", Value: "Gebäude", Type: "STRING"},
		{Key: "email-assignment-intro", Value: "aufgrund deiner angegebenen Verfügbarkeiten, wurdest du der folgenden Veranstaltung zugewiesen:", Type: "STRING"},
		{Key: "email-assignment-outro", Value: "Sollte dir der Termin doch nicht passen, melde dich bitte zeitnah bei uns, indem du auf diese E-Mail reagierst. Wir freuen uns auf einen erfolgreichen Vorkurs mit dir!", Type: "STRING"},
		{Key: "auth-standard-enabled", Value: "1", Type: "BOOLEAN"},
		{Key: "auth-sso-oidc-enabled", Value: "1", Type: "BOOLEAN"},
		{Key: "auth-sso-oidc-name", Value: "Fachschaftslogin", Type: "STRING"},
	}
	if err := insertData(ctx, db, (*models.Setting)(nil), settings, "Settings"); err != nil {
		return err
	}

	return nil
}

func insertData[T any](ctx context.Context, db *bun.DB, model T, data []T, description string) error {
	count, err := db.NewSelect().Model(model).Count(ctx)
	if err != nil {
		return err
	}

	if count == 0 {
		if _, err := db.NewInsert().Model(&data).Exec(ctx); err != nil {
			return fmt.Errorf("%s: %s", description, err)
		}
		log.Infof("%s seeded successfully\n", description)
	}
	return nil
}
