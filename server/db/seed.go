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
		Name:   "Science Building",
		Street: "Main St",
		Number: "1",
		City:   "Example City",
		Zip:    12345,
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
		{Name: "Math", Color: "#87cefa", Kind: "TOPIC"},
		{Name: "Tutorial", Color: "#00ff80", Kind: "EVENT_TYPE"},
		{Name: "Lecture", Color: "#ffbf00", Kind: "EVENT_TYPE"},
	}
	if err := insertData(ctx, db, (*models.Label)(nil), labels, "Labels"); err != nil {
		return err
	}

	events := []*models.Event{{
		Title:       "Linear Algebra",
		Description: "Lorem Ipsum dolor sit amed",
		TopicName:   "Math",
		TypeName:    "Tutorial",
		NeedsTutors: true,
		From:        time.Now().Add(4 * time.Hour),
		To:          time.Now().Add(5 * time.Hour),
	}}
	if err := insertData(ctx, db, (*models.Event)(nil), events, "Events"); err != nil {
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
