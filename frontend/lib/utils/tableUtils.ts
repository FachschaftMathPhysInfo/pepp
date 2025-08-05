import {RowSelectionState} from "@tanstack/react-table";
import {Event} from "@/lib/gql/generated/graphql";
import {CalendarEvent} from "@/components/event-calendar";

export function getEventIdsFromRowSelection(rowSelection: RowSelectionState): number[] {
  return Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number)
}

export function createRowSelectionFromEventIds(eventIds: number []) : RowSelectionState {
  return Object.fromEntries(eventIds.map(id => [id, true]))
}

export function apiEventsToCalendarEvents(events: Event[]): CalendarEvent[] {
  return events.map(event => ({
    id: String(event.ID),
    title: event.title,
    description: event?.description ?? undefined,
    start: event.from,
    end: event.to,
    allDay: false,
    color: "emerald",
  }));
}