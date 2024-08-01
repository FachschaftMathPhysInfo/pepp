package db

import (
	"context"
	"log"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/uptrace/bun"
)

func seedData(ctx context.Context, db *bun.DB) error {
	tutors := []*models.Tutor{
		{User: models.User{Mail: "tutor1@example.de", Fn: "Tutorin", Sn: "One", Confirmed: true}},
		{User: models.User{Mail: "tutor2@example.de", Fn: "Tutor", Sn: "Two", Confirmed: true}},
	}
	if err := insertData(ctx, db, (*models.Tutor)(nil), tutors, "Tutors"); err != nil {
		return err
	}

	buildings := []*models.Building{{
		Name:   "Mathematikon",
		Street: "Beispielstr.",
		Number: "1",
		City:   "Heidelberg",
		Zip:    69115,
		Osm:    "https://www.openstreetmap.org/#map=6/40.355/124.739",
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
	}}
	if err := insertData(ctx, db, (*models.Room)(nil), rooms, "Rooms"); err != nil {
		return err
	}

	labels := []*models.Label{
		{Name: "Mathe", Color: "#87cefa", Kind: "TOPIC"},
		{Name: "Tutorium", Color: "#00ff80", Kind: "EVENT_TYPE"},
		{Name: "Vorlesung", Color: "#ffbf00", Kind: "EVENT_TYPE"},
	}
	if err := insertData(ctx, db, (*models.Label)(nil), labels, "Labels"); err != nil {
		return err
	}

	events := []*models.Event{{
		Title:       "Lineare Algebra",
		Description: "Lorem Ipsum dolor sit amed",
		TopicName:   "Mathe",
		TypeName:    "Tutorium",
		NeedsTutors: true,
		From:        time.Now().Add(4 * time.Hour),
		To:          time.Now().Add(5 * time.Hour),
	}}
	if err := insertData(ctx, db, (*models.Event)(nil), events, "Events"); err != nil {
		return err
	}

	settings := []*models.Setting{
		{Key: "primary-color", Value: "#990000", Type: "COLOR"},
		{Key: "logo-url", Value: "https://mathphys.info/mathphysinfo-logo.png", Type: "STRING"},
		{Key: "homepage-url", Value: "https://mathphys.info", Type: "STRING"},
		{Key: "copyright-notice", Value: "Copyright © 2024, Fachschaft MathPhysInfo. All rights reserved.", Type: "STRING"},
		{Key: "email-greeting", Value: "Hey", Type: "STRING"},
		{Key: "email-signature", Value: "Dein", Type: "STRING"},
		{Key: "email-name", Value: "Pepp - Die Vorkursverwaltung", Type: "STRING"},
		{Key: "email-confirm-subject", Value: "Bitte bestätige deine E-Mail Adresse", Type: "STRING"},
		{Key: "email-confirm-intro", Value: "danke für deine Registrierung als Vorkurstutor/-in!", Type: "STRING"},
		{Key: "email-confirm-button-instruction", Value: "Bitte klicke hier, um deine E-Mail Adresse und die Verfügbarkeiten zu bestätigen:", Type: "STRING"},
		{Key: "email-confirm-button-text", Value: "Bestätigen", Type: "STRING"},
		{Key: "email-confirm-outro", Value: "Wir melden uns bei dir.", Type: "STRING"},
		{Key: "email-assignment-subject", Value: "Deine Veranstaltung", Type: "STRING"},
		{Key: "email-assignment-event-title", Value: "Veranstaltung", Type: "STRING"},
		{Key: "email-assignment-kind-title", Value: "Art", Type: "STRING"},
		{Key: "email-assignment-date-title", Value: "Datum", Type: "STRING"},
		{Key: "email-assignment-time-title", Value: "Uhrzeit", Type: "STRING"},
		{Key: "email-assignment-room-title", Value: "Raum", Type: "STRING"},
		{Key: "email-assignment-building-title", Value: "Gebäude", Type: "STRING"},
		{Key: "email-assignment-intro", Value: "aufgrund deiner angegebenen Verfügbarkeiten, wurdest du der folgenden Veranstaltung zugewiesen:", Type: "STRING"},
		{Key: "email-assignment-outro", Value: "Sollte dir der Termin doch nicht passen, melde dich bitte zeitnah bei uns, indem du auf diese E-Mail reagierst. Wir freuen uns auf einen erfolgreichen Vorkurs mit dir!", Type: "STRING"},
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
			return err
		}
		log.Printf("%s seeded successfully\n", description)
	} else {
		log.Printf("%s already exist, skipping seed\n", description)
	}
	return nil
}
