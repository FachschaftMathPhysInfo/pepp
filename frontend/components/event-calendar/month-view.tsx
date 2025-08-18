"use client"

import React, {useEffect, useMemo, useState} from "react"
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"

import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import {
  CalendarEventItem,
  CalendarCell,
  EventGap,
  EventHeight,
  EventItem,
  getAllEventsForDay,
  getEventsForDay,
  getSpanningEventsForDay,
  sortEvents,
  useEventVisibility,
} from "@/components/event-calendar"
import {DefaultStartHour} from "@/components/event-calendar/constants"
import type {Event} from "@/lib/gql/generated/graphql"


interface MonthViewProps {
  currentDate: Date
  events: Event[]
  onEventSelectAction: (event: Event) => void
  onEventCreateAction: (startTime: Date) => void
}

export function MonthView({
                            currentDate,
                            events,
                            onEventSelectAction,
                            onEventCreateAction,
                          }: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, {weekStartsOn: 0})
    const calendarEnd = endOfWeek(monthEnd, {weekStartsOn: 0})

    return eachDayOfInterval({start: calendarStart, end: calendarEnd})
  }, [currentDate])

  const weekdays = useMemo(() => {
    return Array.from({length: 7}).map((_, i) => {
      const date = addDays(startOfWeek(new Date()), i)
      return format(date, "EEE")
    })
  }, [])

  const weeks = useMemo(() => {
    const result = []
    let week = []

    for (let i = 0; i < days.length; i++) {
      week.push(days[i])
      if (week.length === 7 || i === days.length - 1) {
        result.push(week)
        week = []
      }
    }

    return result
  }, [days])

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelectAction(event)
  }

  const [isMounted, setIsMounted] = useState(false)
  const {contentRef, getVisibleEventCount} = useEventVisibility({
    eventHeight: EventHeight,
    eventGap: EventGap,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div data-slot="month-view" className="contents">
      <div className="border-border/70 grid grid-cols-7 border-b">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-muted-foreground/70 py-2 text-center text-sm"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((week, weekIndex) => (
          <div
            key={`week-${weekIndex}`}
            className="grid grid-cols-7 [&:last-child>*]:border-b-0"
          >
            {week.map((day, dayIndex) => {
              if (!day) return null // Skip if day is undefined

              const dayEvents = getEventsForDay(events, day)
              const spanningEvents = getSpanningEventsForDay(events, day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const cellId = `month-cell-${day.toISOString()}`
              const allDayEvents = [...spanningEvents, ...dayEvents]
              const allEvents = getAllEventsForDay(events, day)

              const isReferenceCell = weekIndex === 0 && dayIndex === 0
              const visibleCount = isMounted
                ? getVisibleEventCount(allDayEvents.length)
                : undefined
              const hasMore =
                visibleCount !== undefined && allDayEvents.length > visibleCount
              const remainingCount = hasMore
                ? allDayEvents.length - visibleCount
                : 0

              return (
                <div
                  key={day.toString()}
                  className="group border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70 border-r border-b last:border-r-0"
                  data-today={isToday(day) || undefined}
                  data-outside-cell={!isCurrentMonth || undefined}
                >
                  <CalendarCell
                    id={cellId}
                    date={day}
                    onClick={() => {
                      const startTime = new Date(day)
                      startTime.setHours(DefaultStartHour, 0, 0)
                      onEventCreateAction(startTime)
                    }}
                  >
                    <div
                      className="group-data-today:bg-primary group-data-today:text-primary-foreground mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm">
                      {format(day, "d")}
                    </div>
                    <div
                      ref={isReferenceCell ? contentRef : null}
                      className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                    >
                      {sortEvents(allDayEvents).map((event, index) => {
                        const eventStart = new Date(event.from)
                        const eventEnd = new Date(event.to)
                        const isFirstDay = isSameDay(day, eventStart)
                        const isLastDay = isSameDay(day, eventEnd)

                        const isHidden =
                          isMounted && visibleCount && index >= visibleCount

                        if (!visibleCount) return null

                        if (!isFirstDay) {
                          return (
                            <div
                              key={`spanning-${event.ID}-${day.toISOString().slice(0, 10)}`}
                              className="aria-hidden:hidden"
                              aria-hidden={isHidden ? "true" : undefined}
                            >
                              <EventItem
                                onClick={(e) => handleEventClick(event, e)}
                                event={event}
                                view="month"
                                isFirstDay={isFirstDay}
                                isLastDay={isLastDay}
                              >
                                <div className="invisible" aria-hidden={true}>
                                  <span>
                                    {format(
                                      new Date(event.from),
                                      "h:mm"
                                    )}{" "}
                                  </span>
                                  {event.title}
                                </div>
                              </EventItem>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={event.ID}
                            className="aria-hidden:hidden"
                            aria-hidden={isHidden ? "true" : undefined}
                          >
                            <CalendarEventItem
                              event={event}
                              view="month"
                              onClick={(e) => handleEventClick(event, e)}
                            />
                          </div>
                        )
                      })}

                      {hasMore && (
                        <Popover modal>
                          <PopoverTrigger asChild>
                            <button
                              className="focus-visible:border-ring focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-[var(--event-gap)] flex h-[var(--event-height)] w-full items-center overflow-hidden px-1 text-left text-[10px] backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] sm:px-2 sm:text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>
                                + {remainingCount}{" "}
                                <span className="max-sm:sr-only">more</span>
                              </span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="center"
                            className="max-w-52 p-3"
                            style={
                              {
                                "--event-height": `${EventHeight}px`,
                              } as React.CSSProperties
                            }
                          >
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                {format(day, "EEE d")}
                              </div>
                              <div className="space-y-1">
                                {sortEvents(allEvents).map((event) => {
                                  const eventStart = new Date(event.from)
                                  const eventEnd = new Date(event.to)
                                  const isFirstDay = isSameDay(day, eventStart)
                                  const isLastDay = isSameDay(day, eventEnd)

                                  return (
                                    <EventItem
                                      key={event.ID}
                                      onClick={(e) =>
                                        handleEventClick(event, e)
                                      }
                                      event={event}
                                      view="month"
                                      isFirstDay={isFirstDay}
                                      isLastDay={isLastDay}
                                    />
                                  )
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </CalendarCell>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
