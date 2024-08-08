package ical

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"github.com/FachschaftMathPhysInfo/pepp/server/graph"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/arran4/golang-ical"
)

func createCalendar(events []*models.Event) string {
	cal := ics.NewCalendar()

	for _, event := range events {
		e := cal.AddEvent(string(event.ID))
		e.SetSummary(event.Title)
		e.SetDescription(event.Description)
		e.SetStartAt(event.From)
		e.SetEndAt(event.To)
	}

	return cal.Serialize()
}

func Handler(ctx context.Context, w http.ResponseWriter, r *http.Request, re *graph.Resolver) {
	var events []*models.Event
	var labels []string
	var umbrellaID int

	u := r.URL.Query().Get("u")
	umbrellaID, err := strconv.Atoi(u)
	if u == "" || err != nil {
		http.Error(w, "Calendar needs a valid umbrella id", http.StatusBadRequest)
		return
	}

	l := r.URL.Query().Get("l")
	if l != "" {
		labels = strings.Split(l, ",")
	}

	events, err = re.Query().Events(ctx, nil, []int{umbrellaID}, labels, nil, nil, nil)
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
