"use client";

import React, { useMemo } from "react";

import { cn } from "@/lib/utils";
import {
  CalendarEventItem,
  CalendarCell,
  EventItem,
  isMultiDayEvent,
  useCurrentTimeIndicator,
  WeekCellsHeight,
  eachDayOfInterval,
  eachHourOfInterval,
} from "@/components/event-calendar";
import type { Event } from "@/lib/gql/generated/graphql";
import {
  EndHour,
  StartHour,
  TimeZone,
} from "@/components/event-calendar/constants";
import { DateTime, Interval } from "luxon";

interface WeekViewProps {
  currentDate: DateTime;
  events: Event[];
  onEventSelectAction: (event: Event) => void;
  onEventCreateAction: (startTime: DateTime) => void;
}

interface PositionedEvent {
  event: Event;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export function WeekView({
  currentDate,
  events,
  onEventSelectAction,
  onEventCreateAction,
}: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = currentDate.startOf("week");
    const weekEnd = currentDate.endOf("week");
    return eachDayOfInterval(weekStart, weekEnd);
  }, [currentDate]);

  const weekStart = useMemo(() => currentDate.startOf("week"), [currentDate]);

  const hours = useMemo(() => {
    const dayStart = currentDate.startOf("day");
    return eachHourOfInterval(
      dayStart.plus({ hours: StartHour }),
      dayStart.plus({ hours: EndHour - 1 })
    );
  }, [currentDate]);

  // Get all-day events and multi-day events for the week
  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Include explicitly marked all-day events or multi-day events
        return isMultiDayEvent(event);
      })
      .filter((event) => {
        const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
        const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);
        return days.some(
          (day) =>
            day.hasSame(eventStart, "day") ||
            day.hasSame(eventEnd, "day") ||
            (day > eventStart && day < eventEnd)
        );
      });
  }, [events, days]);

  // Process events for each day to calculate positions
  const processedDayEvents = useMemo(() => {
    return days.map((day) => {
      // Get events for this day that are not all-day events or multi-day events
      const dayEvents = events.filter((event) => {
        // Skip all-day events and multi-day events
        if (isMultiDayEvent(event)) return false;

        const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
        const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);

        // Check if event is on this day
        return (
          day.hasSame(eventStart, "day") ||
          day.hasSame(eventEnd, "day") ||
          (eventStart < day && eventEnd > day)
        );
      });

      // Sort events by start time and duration
      const sortedEvents = [...dayEvents].sort((a, b) => {
        const aStart = DateTime.fromISO(a.from).setZone(TimeZone);
        const bStart = DateTime.fromISO(b.from).setZone(TimeZone);
        const aEnd = DateTime.fromISO(a.to).setZone(TimeZone);
        const bEnd = DateTime.fromISO(b.to).setZone(TimeZone);

        // First sort by start time
        if (aStart < bStart) return -1;
        if (aStart > bStart) return 1;

        // If start times are equal, sort by duration (longer events first)
        const aDuration = aEnd.diff(aStart, "minutes").minutes;
        const bDuration = bEnd.diff(bStart, "minutes").minutes;
        return bDuration - aDuration;
      });

      // Calculate positions for each event
      const positionedEvents: PositionedEvent[] = [];
      const dayStart = day.startOf("day");

      // Track columns for overlapping events
      const columns: { event: Event; end: DateTime }[][] = [];

      sortedEvents.forEach((event) => {
        const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
        const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);

        // Adjust start and end times if they're outside this day
        const adjustedStart = day.hasSame(eventStart, "day")
          ? eventStart
          : dayStart;
        const adjustedEnd = day.hasSame(eventEnd, "day")
          ? eventEnd
          : dayStart.plus({ hours: 24 });

        // Calculate top position and height
        const startHour = adjustedStart.hour + adjustedStart.minute / 60;
        const endHour = adjustedEnd.hour + adjustedEnd.minute / 60;

        // Adjust the top calculation to account for the new start time
        const top = (startHour - StartHour) * WeekCellsHeight;
        const height = (endHour - startHour) * WeekCellsHeight;

        // Find a column for this event
        let columnIndex = 0;
        let placed = false;

        while (!placed) {
          const col = columns[columnIndex] || [];
          if (col.length === 0) {
            columns[columnIndex] = col;
            placed = true;
          } else {
            const overlaps = col.some((c) => {
              const start = DateTime.fromISO(c.event.from).setZone(TimeZone);
              const end = DateTime.fromISO(c.event.to).setZone(TimeZone);
              const left = Interval.fromDateTimes(adjustedStart, adjustedEnd);
              const right = Interval.fromDateTimes(start, end);
              return left.overlaps(right);
            });
            if (!overlaps) {
              placed = true;
            } else {
              columnIndex++;
            }
          }
        }

        // Ensure column is initialized before pushing
        const currentColumn = columns[columnIndex] || [];
        columns[columnIndex] = currentColumn;
        currentColumn.push({ event, end: adjustedEnd });

        // Calculate width and left position based on number of columns
        const width = columnIndex === 0 ? 1 : 1 - columnIndex * 0.1;
        const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

        positionedEvents.push({
          event,
          top,
          height,
          left,
          width,
          zIndex: 10 + columnIndex, // Higher columns get higher z-index
        });
      });

      return positionedEvents;
    });
  }, [days, events]);

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelectAction(event);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week"
  );

  return (
    <div data-slot="week-view" className="flex h-full flex-col">
      <div className="bg-background/80 border-border/70 sticky top-[80px] z-30 grid grid-cols-8 border-b backdrop-blur-md">
        <div className="text-muted-foreground/70 py-2 text-center text-sm">
          <span className="max-[479px]:sr-only">{DateTime.now().setZone(TimeZone).toFormat("O")}</span>
        </div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className="data-today:text-foreground text-muted-foreground/70 py-2 text-center text-sm data-today:font-medium"
            data-today={day.hasSame(DateTime.local(), "day") || undefined}
          >
            <span className="sm:hidden" aria-hidden="true">
              {day.toFormat("E")[0]} {day.toFormat("d")}
            </span>
            <span className="max-sm:hidden">{day.toFormat("EEE dd")}</span>
          </div>
        ))}
      </div>

      {showAllDaySection && (
        <div className="border-border/70 bg-muted/50 border-b">
          <div className="grid grid-cols-8">
            <div className="border-border/70 relative border-r">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                All day
              </span>
            </div>
            {days.map((day, dayIndex) => {
              const dayAllDayEvents = allDayEvents.filter((event) => {
                const eventStart = DateTime.fromISO(event.from).setZone(TimeZone)
                const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone)
                return (
                  day.hasSame(eventStart, "day") ||
                  (day > eventStart && day < eventEnd) ||
                  day.hasSame(eventEnd, "day")
                );
              });

              return (
                <div
                  key={day.toString()}
                  className="border-border/70 relative border-r p-1 last:border-r-0"
                  data-today={day.hasSame(DateTime.local(), "day") || undefined}
                >
                  {dayAllDayEvents.map((event) => {
                const eventStart = DateTime.fromISO(event.from).setZone(TimeZone)
                const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone)
                    const isFirstDay = day.hasSame(eventStart, "day")
                    const isLastDay = day.hasSame(eventEnd, "day")

                    // Check if this is the first day in the current week view
                    const isFirstVisibleDay =
                      dayIndex === 0 && eventStart.toMillis() < weekStart.toMillis();
                    const shouldShowTitle = isFirstDay || isFirstVisibleDay;

                    return (
                      <EventItem
                        key={`spanning-${event.ID}`}
                        onClick={(e) => handleEventClick(event, e)}
                        event={event}
                        view="month"
                        isFirstDay={isFirstDay}
                        isLastDay={isLastDay}
                      >
                        {/* Show title if it's the first day of the event or the first visible day in the week */}
                        <div
                          className={cn(
                            "truncate",
                            !shouldShowTitle && "invisible"
                          )}
                          aria-hidden={!shouldShowTitle}
                        >
                          {event.title}
                        </div>
                      </EventItem>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid flex-1 grid-cols-8 overflow-hidden">
        <div className="border-border/70 grid auto-cols-fr border-r">
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
            >
              {index > 0 && (
                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                  {hour.toFormat("h a")}
                </span>
              )}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div
            key={day.toString()}
            className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
            data-today={day.hasSame(DateTime.local(), "day") || undefined}
          >
            {/* Positioned events */}
            {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
              <div
                key={positionedEvent.event.ID}
                className="absolute z-10 px-0.5"
                style={{
                  top: `${positionedEvent.top}px`,
                  height: `${positionedEvent.height}px`,
                  left: `${positionedEvent.left * 100}%`,
                  width: `${positionedEvent.width * 100}%`,
                  zIndex: positionedEvent.zIndex,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full w-full">
                  <CalendarEventItem
                    event={positionedEvent.event}
                    view="week"
                    onClick={(e) => handleEventClick(positionedEvent.event, e)}
                    showTime
                    height={positionedEvent.height}
                  />
                </div>
              </div>
            ))}

            {/* Current time indicator - only show for today's column */}
            {currentTimeVisible && day.hasSame(DateTime.local(), "day") && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="relative flex items-center">
                  <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                  <div className="bg-primary h-[2px] w-full"></div>
                </div>
              </div>
            )}
            {hours.map((hour) => {
              const hourValue = hour.hour;
              return (
                <div
                  key={hour.toString()}
                  className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
                >
                  {/* Quarter-hour intervals */}
                  {[0, 1, 2, 3].map((quarter) => {
                    const quarterHourTime = hourValue + quarter * 0.25;
                    return (
                      <CalendarCell
                        key={`${hour.toString()}-${quarter}`}
                        id={`week-cell-${day.toISODate()}-${quarterHourTime}`}
                        date={day}
                        time={quarterHourTime}
                        className={cn(
                          "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                          quarter === 0 && "top-0",
                          quarter === 1 &&
                            "top-[calc(var(--week-cells-height)/4)]",
                          quarter === 2 &&
                            "top-[calc(var(--week-cells-height)/4*2)]",
                          quarter === 3 &&
                            "top-[calc(var(--week-cells-height)/4*3)]"
                        )}
                        onClick={() => {
                          const startTime = day.setZone(TimeZone);
                          startTime.set({hour: hourValue})
                          startTime.set({minute: quarter * 15})
                          onEventCreateAction(startTime);
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
