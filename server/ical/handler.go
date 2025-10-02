package ical

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"time"
	_ "time/tzdata"

	"github.com/FachschaftMathPhysInfo/pepp/server/graph"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/arran4/golang-ical"
	log "github.com/sirupsen/logrus"
)

func timeToLocale(t time.Time, loc *time.Location) time.Time {
	return time.Date(
		t.Year(), t.Month(), t.Day(),
		t.Hour(), t.Minute(), t.Second(),
		t.Nanosecond(), loc,
	)
}

func createCalendar(events []*models.Event) string {
	locale := os.Getenv("LOCALE")
	if locale == "" {
		locale = "UTC"
	}

	loc, err := time.LoadLocation(locale)
	if err != nil {
		log.Error("%s is not a valid locale, falling back to UTC", locale)
		loc, _ = time.LoadLocation("UTC")
	}

	cal := ics.NewCalendar()
	cal.SetName(events[0].Umbrella.Title)

	for _, event := range events {
		e := cal.AddEvent(string(event.ID))
		e.SetSummary(event.Title)
		e.SetDescription(event.Description)
		e.SetStartAt(timeToLocale(event.From, loc))
		e.SetEndAt(timeToLocale(event.To, loc))
	}

	return cal.Serialize()
}

func Handler(ctx context.Context, w http.ResponseWriter, r *http.Request, re *graph.Resolver) {
	var events []*models.Event
	// var topics []string
	// var types []string
	var umbrellaID int

	e := r.URL.Query().Get("e")
	umbrellaID, err := strconv.Atoi(e)
	if e == "" || err != nil {
		http.Error(w, "Calendar needs a valid umbrella id", http.StatusBadRequest)
		return
	}

	// to := r.URL.Query()["to"]
	// if len(to) > 0 {
	// 	topics = to
	// }

	// ty := r.URL.Query()["ty"]
	// if len(ty) > 0 {
	// 	types = ty
	// }

	events, err = re.Query().Events(ctx, nil, []int{umbrellaID}, nil, nil, nil, nil, nil, nil)
	if err != nil || len(events) == 0 {
		http.Error(w, "No events found", http.StatusBadRequest)
		return
	}

	cal := createCalendar(events)
	w.Header().Set("Content-Type", "text/calendar")
	w.Header().Set("Content-Disposition", "attachment; filename=pepp.ics")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(cal))
}
