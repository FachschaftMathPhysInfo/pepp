"use client"

import React, { useMemo } from "react"
import { RiCalendarEventLine } from "@remixicon/react"
import { addDays, format, isToday } from "date-fns"

import {
  AgendaDaysToShow,
  EventItem,
  getAgendaEventsForDay,
} from "@/components/event-calendar"
import type { Event } from "@/lib/gql/generated/graphql"

interface AgendaViewProps {
  currentDate: Date
  events: Event[]
  onEventSelectAction: (event: Event) => void
}

export function AgendaView({
  currentDate,
  events,
  onEventSelectAction,
}: AgendaViewProps) {
  // Show events for the next days based on constant
  const days = useMemo(() => {
    return Array.from({ length: AgendaDaysToShow }, (_, i) =>
      addDays(new Date(currentDate), i)
    )
  }, [currentDate])

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelectAction(event)
  }

  // Check if there are any days with events
  const hasEvents = days.some(
    (day) => getAgendaEventsForDay(events, day).length > 0
  )

  return (
    <div className="border-border/70 border-t px-4">
      {!hasEvents ? (
        <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
          <RiCalendarEventLine
            size={32}
            className="text-muted-foreground/50 mb-2"
          />
          <h3 className="text-lg font-medium">Keine Veranstaltungen gefunden.</h3>
          <p className="text-muted-foreground">
            In diesem Zeitraum scheinen keine Veranstaltungen statt zu finden.
          </p>
        </div>
      ) : (
        days.map((day) => {
          const dayEvents = getAgendaEventsForDay(events, day)

          if (dayEvents.length === 0) return null

          return (
            <div
              key={day.toString()}
              className="border-border/70 relative my-12 border-t"
            >
              <span
                className="bg-background absolute -top-3 left-0 flex h-6 items-center pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
                data-today={isToday(day) || undefined}
              >
                {format(day, "d MMM, EEEE")}
              </span>
              <div className="mt-6 space-y-2">
                {dayEvents.map((event) => (
                  <EventItem
                    key={event.ID}
                    event={event}
                    view="agenda"
                    onClick={(e) => handleEventClick(event, e)}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
