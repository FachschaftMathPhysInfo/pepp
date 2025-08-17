"use client"

import React from "react"

import {EventItem,} from "@/components/event-calendar"
import type {Event} from "@/lib/gql/generated/graphql"


interface CalendarEventItemProps {
  event: Event
  view: "month" | "week" | "day"
  showTime?: boolean
  onClick?: (e: React.MouseEvent) => void
  height?: number
  "aria-hidden"?: boolean | "true" | "false"
}

export function CalendarEventItem({
                                 event,
                                 view,
                                 showTime,
                                 onClick,
                                 height,
                               }: CalendarEventItemProps) {
  const style = {
    height: height || "auto",
  }

  return (
    <div
      style={style}
      className="touch-none"
    >
      <EventItem
        event={event}
        view={view}
        showTime={showTime}
        isFirstDay
        isLastDay
        onClick={onClick}
      />
    </div>
  )
}
