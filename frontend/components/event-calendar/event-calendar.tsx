"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RiCalendarCheckLine } from "@remixicon/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AgendaDaysToShow,
  AgendaView,
  CalendarView,
  DayView,
  EventDialog,
  EventGap,
  EventHeight,
  MonthView,
  TimeZone,
  WeekCellsHeight,
  WeekView,
  getInitialCalendarDate,
} from "@/components/event-calendar";
import type { Event } from "@/lib/gql/generated/graphql";
import { LabelKind, Role } from "@/lib/gql/generated/graphql";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getViewModeFromQuery,
  mergeQueryString,
  VIEWMODE_QUERY_KEY,
} from "@/lib/query-urls";
import { useUser } from "@/components/provider/user-provider";
import { DateTime } from "luxon";

export interface EventCalendarProps {
  events?: Event[];
  onEventAdd?: (event: Event) => void;
  onEventUpdate?: (event: Event) => void;
  className?: string;
  initialView?: CalendarView;
}

export function EventCalendar({
  events = [],
  className,
  initialView = "month",
}: EventCalendarProps) {
  const [initialDate, setInitialDate] = useState(
    getInitialCalendarDate(events)
  );
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [hasInitializedFromQuery, setHasInitializedFromQuery] =
    React.useState(false);
  const [view, setView] = useState<CalendarView>(initialView);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { user } = useUser();

  useEffect(() => {
    setInitialDate(getInitialCalendarDate(events));
  }, [events]);

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // TODO: change here
      switch (e.key.toLowerCase()) {
        case "m":
          setView("month");
          break;
        case "w":
          setView("week");
          break;
        case "d":
          setView("day");
          break;
        case "a":
          setView("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEventDialogOpen]);

  // Load view from query parameters
  useEffect(() => {
    if (hasInitializedFromQuery) return;

    const viewmode = getViewModeFromQuery(searchParams);
    if (viewmode) setView(viewmode as CalendarView);
    else setView("agenda");

    setHasInitializedFromQuery(true);
  }, []);

  // Propagate changes in handle to URL
  useEffect(() => {
    if (!hasInitializedFromQuery) return; // only after init

    const newSearchParams = mergeQueryString(searchParams, VIEWMODE_QUERY_KEY, [
      view,
    ]);
    router.replace(pathname + "?" + newSearchParams); // replace avoids adding history entries
  }, [view, hasInitializedFromQuery, pathname, searchParams]);

  const handlePrevious = () => {
    if (view === "month") {
      setInitialDate(initialDate.minus({ months: 1 }));
    } else if (view === "week") {
      setInitialDate(initialDate.minus({ weeks: 1 }));
    } else if (view === "day") {
      setInitialDate(initialDate.minus({ days: 1 }));
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setInitialDate(initialDate.minus({ days: AgendaDaysToShow }));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setInitialDate(initialDate.plus({ months: 1 }));
    } else if (view === "week") {
      setInitialDate(initialDate.plus({ weeks: 1 }));
    } else if (view === "day") {
      setInitialDate(initialDate.plus({ days: 1 }));
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setInitialDate(initialDate.plus({ days: AgendaDaysToShow }));
    }
  };

  const handleToday = () => {
    setInitialDate(DateTime.now().setZone(TimeZone));
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (startTime: DateTime) => {
    // Snap to 15-minute intervals
    const minutes = startTime.minute;
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.set({minute: minutes - remainder})
      } else {
        // Round up to nearest 15 min
        startTime.set({minute: minutes + 15- remainder})
      }
      startTime.set({second: 0})
              startTime.set({millisecond: 0})
    }

    const newEvent: Event = {
      ID: 0,
      title: "",
      from: startTime,
      to: startTime.plus({hours: 1}),
      tutorialsOpen: false,
      registrationNeeded: true,
      needsTutors: false,
      topics: [{ ID: 0, name: "", kind: LabelKind.Topic, color: "" }],
      type: { ID: 0, name: "", kind: LabelKind.EventType, color: "" },
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return initialDate.toFormat("MMMM yyyy");
    } else if (view === "week") {
      const start = initialDate.startOf("week");
      const end = initialDate.endOf("week");
      if (start.hasSame(end, "month")) {
        return start.toFormat("MMMM yyyy");
      } else {
        return `${start.toFormat("MMM")} - ${end.toFormat("MMM yyyy")}`;
      }
    } else if (view === "day") {
      return (
        <>
          <span className="sm:hidden" aria-hidden="true">
            {initialDate.toFormat("MMM d, yyyy")}
          </span>
          <span className="hidden sm:inline md:hidden" aria-hidden="true">
            {initialDate.toFormat("MMMM d, yyyy")}
          </span>
          <span className="hidden md:inline">
            {initialDate.toFormat("EEE MMMM d, yyyy")}
          </span>
        </>
      );
    } else if (view === "agenda") {
      // Show the month range for agenda view
      const start = initialDate;
      const end = initialDate.plus({ days: AgendaDaysToShow - 1 });

      if (start.hasSame(end, "month")) {
        return start.toFormat("MMMM yyyy");
      } else {
        return `${start.toFormat("MMM")} - ${end.toFormat("MMM yyyy")}`;
      }
    } else {
      return initialDate.toFormat("MMMM yyyy");
    }
  }, [initialDate, view]);

  return (
    <div
      className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex items-center justify-between p-2 sm:p-4",
          className
        )}
      >
        <div className="flex items-center gap-1 sm:gap-4">
          <Button
            variant="outline"
            className="max-[479px]:aspect-square max-[479px]:p-0!"
            onClick={handleToday}
          >
            <RiCalendarCheckLine
              className="min-[480px]:hidden"
              size={16}
              aria-hidden="true"
            />
            <span className="max-[479px]:sr-only">Today</span>
          </Button>
          <div className="flex items-center sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              aria-label="Previous"
            >
              <ChevronLeftIcon size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRightIcon size={16} aria-hidden="true" />
            </Button>
          </div>
          <h2 className="text-sm font-semibold sm:text-lg md:text-xl">
            {viewTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                <span>
                  <span className="min-[480px]:hidden" aria-hidden="true">
                    {view.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-[479px]:sr-only">
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </span>
                </span>
                <ChevronDownIcon
                  className="-me-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
              <DropdownMenuItem onClick={() => setView("month")}>
                Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("week")}>
                Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("day")}>
                Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView("agenda")}>
                Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user?.role === Role.Admin && (
            <Button
              className="max-[479px]:aspect-square max-[479px]:p-0!"
              onClick={() => {
                setSelectedEvent(null); // Ensure we're creating a new event
                setIsEventDialogOpen(true);
              }}
            >
              <PlusIcon
                className="opacity-60 sm:-ms-1"
                size={16}
                aria-hidden="true"
              />
              <span className="max-sm:sr-only">Neues Event</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {view === "month" && (
          <MonthView
            currentDate={initialDate}
            events={events}
            onEventSelectAction={handleEventSelect}
            onEventCreateAction={handleEventCreate}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={initialDate}
            events={events}
            onEventSelectAction={handleEventSelect}
            onEventCreateAction={handleEventCreate}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={initialDate}
            events={events}
            onEventSelectAction={handleEventSelect}
            onEventCreateAction={handleEventCreate}
          />
        )}
        {view === "agenda" && (
          <AgendaView
            currentDate={initialDate}
            events={events}
            onEventSelectAction={handleEventSelect}
          />
        )}
      </div>

      <EventDialog
        event={selectedEvent}
        isOpen={isEventDialogOpen}
        onCloseAction={() => {
          setIsEventDialogOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
