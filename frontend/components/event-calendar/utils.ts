import { TimeZone, type EventColor } from "@/components/event-calendar";
import type { Event } from "@/lib/gql/generated/graphql";

import { DateTime } from "luxon";

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color?: EventColor | string): string {
  const eventColor = color || "sky";

  switch (eventColor) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8";
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8";
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8";
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8";
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8";
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
  }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(
  isFirstDay: boolean,
  isLastDay: boolean
): string {
  if (isFirstDay && isLastDay) {
    return "rounded"; // Both ends rounded
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none"; // Only left end rounded
  } else if (isLastDay) {
    return "rounded-r rounded-l-none"; // Only right end rounded
  } else {
    return "rounded-none"; // No rounded corners
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: Event): boolean {
  const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
  const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);
  return eventStart.day !== eventEnd.day;
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(events: Event[], day: DateTime): Event[] {
  return events
    .filter((event) => {
      const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
      return day.hasSame(eventStart, "day");
    })
    .sort(
      (a, b) =>
        DateTime.fromISO(a.from).setZone(TimeZone).toMillis() -
        DateTime.fromISO(b.from).setZone(TimeZone).toMillis()
    );
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return (
      DateTime.fromISO(a.from).setZone(TimeZone).toMillis() -
      DateTime.fromISO(b.from).setZone(TimeZone).toMillis()
    );
  });
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
  events: Event[],
  day: DateTime
): Event[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
    const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !day.hasSame(eventStart, "day") &&
      (day.hasSame(eventEnd, "day") || (day > eventStart && day < eventEnd))
    );
  });
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(events: Event[], day: DateTime): Event[] {
  return events.filter((event) => {
    const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
    const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);
    return (
      day.hasSame(eventStart, "day") ||
      day.hasSame(eventEnd, "day") ||
      (day > eventStart && day < eventEnd)
    );
  });
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(events: Event[], day: DateTime): Event[] {
  return events
    .filter((event) => {
      const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
      const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);
      return (
        day.hasSame(eventStart, "day") ||
        day.hasSame(eventEnd, "day") ||
        (day > eventStart && day < eventEnd)
      );
    })
    .sort(
      (a, b) =>
        DateTime.fromISO(a.from).setZone(TimeZone).toMillis() -
        DateTime.fromISO(b.from).setZone(TimeZone).toMillis()
    );
}

export function getInitialCalendarDate(events: Event[]): DateTime {
  const now = DateTime.now().setZone(TimeZone);

  if (events.length === 0) return now;

  const sortedEvents = events
    .map((event) => DateTime.fromISO(event.from).setZone(TimeZone))
    .sort((a, b) => a.toMillis() - b.toMillis());

  const firstEventDate = sortedEvents[0];

  if (firstEventDate > now) return firstEventDate;
  return now;
}

export function eachDayOfInterval(start: DateTime, end: DateTime) {
  let s = start.startOf("day");
  const e = end.startOf("day");
  const days = [];
  while (s <= e) {
    days.push(s);
    s = s.plus({ days: 1 });
  }
  return days;
}

export function eachHourOfInterval(start: DateTime, end: DateTime) {
  let s = start.startOf("hour");
  const e = end.startOf("hour");
  const hours = [];
  while (s <= e) {
    hours.push(s);
    s = s.plus({ hours: 1 });
  }
  return hours;
}
