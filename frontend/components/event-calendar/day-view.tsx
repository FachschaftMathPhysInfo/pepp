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
  eachHourOfInterval,
} from "@/components/event-calendar";
import {Event, Role} from "@/lib/gql/generated/graphql";
import {
  EndHour,
  StartHour,
  TimeZone,
} from "@/components/event-calendar/constants";
import { DateTime, Interval } from "luxon";
import {useUser} from "@/components/provider/user-provider";
import {UserRound} from "lucide-react";

interface DayViewProps {
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

export function DayView({
  currentDate,
  events,
  onEventSelectAction,
  onEventCreateAction,
}: DayViewProps) {
  const { user } = useUser()
  const hours = useMemo(() => {
    const dayStart = currentDate.startOf("day");
    return eachHourOfInterval(
      dayStart.plus({ hours: StartHour }),
      dayStart.plus({ hours: EndHour - 1 })
    );
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
        const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);
        return (
          currentDate.hasSame(eventStart, "day") ||
          currentDate.hasSame(eventEnd, "day") ||
          (currentDate > eventStart && currentDate < eventEnd)
        );
      })
      .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
  }, [currentDate, events]);

  // Filter all-day events
  const allDayEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Include explicitly marked all-day events or multi-day events
      return isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Get only single-day time-based events
  const timeEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Exclude all-day events and multi-day events
      return !isMultiDayEvent(event);
    });
  }, [dayEvents]);

  // Process events to calculate positions
  const positionedEvents = useMemo(() => {
    const result: PositionedEvent[] = [];
    const dayStart = currentDate.startOf("day");

    // Sort events by start time and duration
    const sortedEvents = [...timeEvents].sort((a, b) => {
      const aStart = DateTime.fromISO(a.from).setZone(TimeZone);
      const bStart = DateTime.fromISO(b.from).setZone(TimeZone);
      const aEnd = DateTime.fromISO(a.to).setZone(TimeZone);
      const bEnd = DateTime.fromISO(b.to).setZone(TimeZone);

      // First sort by start time
      if (aStart < bStart) return -1;
      if (aStart > bStart) return 1;

      // If start times are equal, sort by duration (longer events first)
      const aDuration = aEnd.diff(aStart, "minute").minutes;
      const bDuration = bEnd.diff(bStart, "minute").minutes;
      return bDuration - aDuration;
    });

    // Track columns for overlapping events
    const columns: { event: Event; end: DateTime }[][] = [];

    sortedEvents.forEach((event) => {
      const eventStart = DateTime.fromISO(event.from).setZone(TimeZone);
      const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);

      // Adjust start and end times if they're outside this day
      const adjustedStart = currentDate.hasSame(eventStart, "day")
        ? eventStart
        : dayStart;
      const adjustedEnd = currentDate.hasSame(eventEnd, "day")
        ? eventEnd
        : dayStart.plus({ hours: 24 });

      // Calculate top position and height
      const startHour = adjustedStart.hour + adjustedStart.minute / 60;
      const endHour = adjustedEnd.hour + adjustedEnd.minute / 60;
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

      // First column takes full width, others are indented by 10% and take 90% width
      const width = columnIndex === 0 ? 1 : 1 - columnIndex * 0.1;
      const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

      result.push({
        event,
        top,
        height,
        left,
        width,
        zIndex: 10 + columnIndex, // Higher columns get higher z-index
      });
    });

    return result;
  }, [currentDate, timeEvents]);

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelectAction(event);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "day"
  );

  return (
    <div data-slot="day-view" className="contents">
      {showAllDaySection && (
        <div className="border-border/70 bg-muted/50 border-t">
          <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
            <div className="relative">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                All day
              </span>
            </div>
            <div className="border-border/70 relative border-r p-1 last:border-r-0">
              {allDayEvents.map((event) => {
                const eventStart = DateTime.fromISO(event.from).setZone(
                  TimeZone
                );
                const eventEnd = DateTime.fromISO(event.to).setZone(TimeZone);
                const isFirstDay = currentDate.hasSame(eventStart, "day");
                const isLastDay = currentDate.hasSame(eventEnd, "day");

                return (
                  <EventItem
                    key={`spanning-${event.ID}`}
                    onClick={(e) => handleEventClick(event, e)}
                    event={event}
                    view="month"
                    isFirstDay={isFirstDay}
                    isLastDay={isLastDay}
                  >
                    {/* Always show the title in day view for better usability */}
                    <div>{event.title}</div>
                  </EventItem>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="border-border/70 grid flex-1 grid-cols-[3rem_1fr] overflow-hidden border-t sm:grid-cols-[4rem_1fr]">
        <div>
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0"
            >
              {index > 0 && (
                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                  {hour.toFormat("h a")}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="relative">
          {/* Positioned events */}
          {positionedEvents.map((positionedEvent) => (
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
            >
              <div className="h-full w-full">
                <CalendarEventItem
                  event={positionedEvent.event}
                  view="day"
                  onClick={(e) => handleEventClick(positionedEvent.event, e)}
                  showTime
                  height={positionedEvent.height}
                />
              </div>
            </div>
          ))}

          {/* Current time indicator */}
          {currentTimeVisible && (
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

          {/* Time grid */}
          {hours.map((hour) => {
            const hourValue = hour.hour;
            return (
              <div
                key={hour.toString()}
                className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0"
              >
                {/* Quarter-hour intervals */}
                {[0, 1, 2, 3].map((quarter) => {
                  const quarterHourTime = hourValue + quarter * 0.25;
                  return (
                    <CalendarCell
                      key={`${hour.toString()}-${quarter}`}
                      id={`day-cell-${currentDate.toISO()}-${quarterHourTime}`}
                      date={currentDate}
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
                        if (user?.role !== Role.Admin) return
                        const startTime = currentDate;
                        startTime.set({ hour: hourValue });
                        startTime.set({ minute: quarter * 15 });
                        onEventCreateAction(startTime);
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
