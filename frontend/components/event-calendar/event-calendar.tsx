"use client";

import React, {useEffect, useMemo, useState} from "react";
import {RiCalendarCheckLine} from "@remixicon/react";
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon,} from "lucide-react";

import {cn, getInitialCalendarDate} from "@/lib/utils";
import {Button} from "@/components/ui/button";
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
  WeekCellsHeight,
  WeekView,
} from "@/components/event-calendar";
import {useUser} from "@/components/providers";
import type {Event} from "@/lib/gql/generated/graphql";
import {LabelKind, Role} from "@/lib/gql/generated/graphql";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {getViewModeFromQuery, mergeQueryString} from "@/lib/query-urls";

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
  const [initialDate, setInitialDate] = useState(getInitialCalendarDate(events));
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [hasInitializedFromQuery, setHasInitializedFromQuery] = React.useState(false);
  const [view, setView] = useState<CalendarView>(initialView);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const {user} = useUser();

  useEffect(() => {
    setInitialDate(getInitialCalendarDate(events))
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
          handleViewModeChange("month");
          break;
        case "w":
          handleViewModeChange("week");
          break;
        case "d":
          handleViewModeChange("day");
          break;
        case "a":
          handleViewModeChange("agenda");
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
    if(hasInitializedFromQuery) return

    const viewmode = getViewModeFromQuery(searchParams);
    if (viewmode) setView(viewmode as CalendarView);
    else setView('agenda');

    setHasInitializedFromQuery(true)
  }, []);

  const handlePrevious = () => {
    if (view === "month") {
      setInitialDate(subMonths(initialDate, 1));
    } else if (view === "week") {
      setInitialDate(subWeeks(initialDate, 1));
    } else if (view === "day") {
      setInitialDate(addDays(initialDate, -1));
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setInitialDate(addDays(initialDate, -AgendaDaysToShow));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setInitialDate(addMonths(initialDate, 1));
    } else if (view === "week") {
      setInitialDate(addWeeks(initialDate, 1));
    } else if (view === "day") {
      setInitialDate(addDays(initialDate, 1));
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setInitialDate(addDays(initialDate, AgendaDaysToShow));
    }
  };

  const handleToday = () => {
    setInitialDate(new Date());
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (startTime: Date) => {
    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder);
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder));
      }
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
    }

    const newEvent: Event = {
      ID: 0,
      title: "",
      from: startTime,
      to: addHours(startTime, 1),
      tutorialsOpen: false,
      needsTutors: false,
      topic: {ID: 0, name: "", kind: LabelKind.Topic, color: ""},
      type: {ID: 0, name: "", kind: LabelKind.EventType, color: ""},
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  const handleViewModeChange = (viewmode: CalendarView) => {
    setView(viewmode);
    const newSearchParams = mergeQueryString(searchParams, 'vm', [viewmode]);
    router.push(pathname + '?' + newSearchParams)
  }

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(initialDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(initialDate, {weekStartsOn: 0});
      const end = endOfWeek(initialDate, {weekStartsOn: 0});
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else if (view === "day") {
      return (
        <>
          <span className="sm:hidden" aria-hidden="true">
            {format(initialDate, "MMM d, yyyy")}
          </span>
          <span className="hidden sm:inline md:hidden" aria-hidden="true">
            {format(initialDate, "MMMM d, yyyy")}
          </span>
          <span className="hidden md:inline">
            {format(initialDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      );
    } else if (view === "agenda") {
      // Show the month range for agenda view
      const start = initialDate;
      const end = addDays(initialDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else {
      return format(initialDate, "MMMM yyyy");
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
              <ChevronLeftIcon size={16} aria-hidden="true"/>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRightIcon size={16} aria-hidden="true"/>
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
              <DropdownMenuItem onClick={() => handleViewModeChange("month")}>
                Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewModeChange("week")}>
                Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewModeChange("day")}>
                Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewModeChange("agenda")}>
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
