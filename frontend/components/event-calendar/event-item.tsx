"use client";

import React, { useMemo } from "react";

import { cn, hexToRGBA } from "@/lib/utils";
import { TimeZone, getBorderRadiusClasses } from "@/components/event-calendar";
import type { Event } from "@/lib/gql/generated/graphql";
import Markdown from "react-markdown";
import { DateTime } from "luxon";

const formatTimeWithOptionalMinutes = (date: DateTime) => {
  return date.toFormat(date.minute === 0 ? "ha" : "h:mma").toLowerCase();
};

interface EventWrapperProps {
  event: Event;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  currentTime?: DateTime;
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  onClick,
  className,
  children,
  currentTime,
}: EventWrapperProps) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  const displayEnd = currentTime
    ? DateTime.fromMillis(
        currentTime.toMillis() +
          (DateTime.fromISO(event.to).setZone(TimeZone).toMillis() -
          DateTime.fromISO(event.from).setZone(TimeZone).toMillis())
      )
    : DateTime.fromISO(event.to).setZone(TimeZone);

  const isEventInPast = displayEnd.toMillis() < DateTime.now().toMillis();

  return (
    <button
      style={{
        backgroundColor: hexToRGBA(event.type.color, 0.3),
      }}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full overflow-hidden px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
        getBorderRadiusClasses(true, true),
        className
      )}
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface EventItemProps {
  event: Event;
  view: "month" | "week" | "day" | "agenda";
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  currentTime?: DateTime; // For updating time during drag
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function EventItem({
  event,
  view,
  onClick,
  showTime,
  currentTime,
  children,
  className,
}: EventItemProps) {
  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(() => {
    return currentTime || DateTime.fromISO(event.from).setZone(TimeZone);
  }, [currentTime, event.from]);

  const displayEnd = useMemo(() => {
    return currentTime
      ? DateTime.fromMillis(
          currentTime.toMillis() +
            (DateTime.fromISO(event.to).setZone(TimeZone).toMillis() -
            DateTime.fromISO(event.from).setZone(TimeZone).toMillis())
        )
      : DateTime.fromISO(event.to).setZone(TimeZone);
  }, [currentTime, event.from, event.to]);

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    return displayEnd.diff(displayStart, "minutes").minutes
  }, [displayStart, displayEnd]);

  console.log(durationMinutes)

  const getEventTime = () => {
    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart);
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(
      displayStart
    )} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
  };

  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        onClick={onClick}
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
          className
        )}
        currentTime={currentTime}
      >
        {children || (
          <span className="truncate">
            <span className="truncate font-normal opacity-70 sm:text-[11px]">
              {formatTimeWithOptionalMinutes(displayStart)}{" "}
            </span>
            {event.title}
          </span>
        )}
      </EventWrapper>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        onClick={onClick}
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className
        )}
        currentTime={currentTime}
      >
        {durationMinutes < 45 ? (
          <div className="truncate">
            {event.title}{" "}
            {showTime && (
              <span className="opacity-70">
                {formatTimeWithOptionalMinutes(displayStart)}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="truncate font-medium">{event.title}</div>
            {showTime && (
              <div className="truncate font-normal opacity-70 sm:text-[11px]">
                {getEventTime()}
              </div>
            )}
          </>
        )}
      </EventWrapper>
    );
  }

  // Agenda view - kept separate since it's significantly different
  return (
    <button
      style={{
        backgroundColor: hexToRGBA(event.type.color, 0.3),
      }}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded p-2 text-left transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-90",
        className
      )}
      data-past-event={
        DateTime.fromISO(event.to).setZone(TimeZone).toMillis() <
          DateTime.now().toMillis() || undefined
      }
      onClick={onClick}
    >
      <div className="text-sm font-medium">{event.title}</div>
      <div className="text-xs opacity-70"></div>
      {event.description && (
        <div className="my-1 text-xs opacity-90">
          <Markdown>{event.description}</Markdown>
        </div>
      )}
    </button>
  );
}
