"use client"

import { useEffect, useMemo, useRef } from "react"
import { format, isSameDay } from "date-fns"
import { XIcon } from "lucide-react"

import { EventItem} from "@/components/event-calendar"
import type { Event } from "@/lib/gql/generated/graphql"


interface EventsPopupProps {
  date: Date
  events: Event[]
  position: { top: number; left: number }
  onCloseAction: () => void
  onEventSelectAction: (event: Event) => void
}

export function EventsPopup({
  date,
  events,
  position,
  onCloseAction,
  onEventSelectAction,
}: EventsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onCloseAction()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onCloseAction])

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onCloseAction])

  const handleEventClick = (event: Event) => {
    onEventSelectAction(event)
    onCloseAction()
  }

  // Adjust position to ensure popup stays within viewport
  const adjustedPosition = useMemo(() => {
    const positionCopy = { ...position }

    // Check if we need to adjust the position to fit in the viewport
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Adjust horizontally if needed
      if (positionCopy.left + rect.width > viewportWidth) {
        positionCopy.left = Math.max(0, viewportWidth - rect.width)
      }

      // Adjust vertically if needed
      if (positionCopy.top + rect.height > viewportHeight) {
        positionCopy.top = Math.max(0, viewportHeight - rect.height)
      }
    }

    return positionCopy
  }, [position])

  return (
    <div
      ref={popupRef}
      className="bg-background absolute z-50 max-h-96 w-80 overflow-auto rounded-md border shadow-lg"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
      }}
    >
      <div className="bg-background sticky top-0 flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{format(date, "d MMMM yyyy")}</h3>
        <button
          onClick={onCloseAction}
          className="hover:bg-muted rounded-full p-1"
          aria-label="Close"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 p-3">
        {events.length === 0 ? (
          <div className="text-muted-foreground py-2 text-sm">No events</div>
        ) : (
          events.map((event) => {
            const eventStart = new Date(event.from)
            const eventEnd = new Date(event.to)
            const isFirstDay = isSameDay(date, eventStart)
            const isLastDay = isSameDay(date, eventEnd)

            return (
              <div
                key={event.ID}
                className="cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <EventItem
                  event={event}
                  view="agenda"
                  isFirstDay={isFirstDay}
                  isLastDay={isLastDay}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
