import { Event } from "@/lib/gql/generated/graphql";
import {
  calculateEventDurationInHours,
  formatDateToDDMM,
  getISOWeekNumber,
  groupEvents,
} from "@/lib/utils";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useUser } from "./providers";
import EventDialog from "@/components/dialog/events/event-dialog";
import { Dialog } from "./ui/dialog";
import PlannerItem from "./planner-item";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface PlannerProps {
  events: Event[];
}

export function Planner({ events }: PlannerProps) {
  const { user } = useUser();
  const groupedEvents = groupEvents(events);
  const weeks: [number, Record<string, Event[]>][] =
    Object.entries(groupedEvents).map(([week, days]) => [Number(week), days]);
  const totalWeeks = weeks.length;

  if (!totalWeeks) return

  // state for small-screen navigation
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // time tracking state
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [closeupID, setCloseupID] = useState(0);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // render a single week
  const renderWeek = (
    [weekNumber, days]: [number, Record<string, Event[]>],
    weekIndex: number
  ) => (
    <div key={weekNumber} className="space-y-4 flex-1">
      {totalWeeks > 1 && (
        <h2 className="text-2xl font-semibold text-center">
          Woche {weekIndex + 1}
        </h2>
      )}
      {Object.entries(days).map(([day, dayEvents]: [string, Event[]]) => {
        const dayStartDate = new Date(dayEvents[0].from);
        const dayEndDate = new Date(dayEvents[dayEvents.length - 1].to);
        const now = new Date();
        const tPosition = () => {
          const startTime =
            dayStartDate.getHours() * 60 + dayStartDate.getMinutes();
          const endTime = dayEndDate.getHours() * 60 + dayEndDate.getMinutes();
          const progress =
            ((currentMinutes - startTime) / (endTime - startTime)) * 100;
          return progress;
        };

        return (
          <Card key={day}>
            <CardHeader>
              <CardTitle>{day}</CardTitle>
              <CardDescription>
                {formatDateToDDMM(dayStartDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row">
              {dayStartDate.getDay() === now.getDay() &&
                getISOWeekNumber(dayStartDate) === getISOWeekNumber(now) && (
                  <div className="relative w-2 mr-[24px]">
                    <div className="absolute inset-0 w-0.5 bg-gray-300 mx-auto" />
                    {now.getTime() >= dayStartDate.getTime() &&
                      now.getTime() <= dayEndDate.getTime() && (
                        <div
                          className="absolute left-0 right-0 bg-red-500 w-2 h-2 rounded-full mx-auto"
                          style={{ top: `${tPosition()}%` }}
                        />
                      )}
                  </div>
                )}
              <ul className="flex flex-col w-full">
                {dayEvents.map((event, eventIndex) => {
                  const gap = eventIndex
                    ? calculateEventDurationInHours(
                        dayEvents[eventIndex - 1].to,
                        event.from
                      )
                    : 0;
                  const eventDurationHours = calculateEventDurationInHours(
                    event.from,
                    event.to
                  );
                  const registration = user?.registrations?.find(
                    (r) => r.event.ID === event.ID
                  );

                  return (
                    <div key={event.ID}>
                      <div
                        className="bg-transparent"
                        style={{ height: `${gap * 100}px` }}
                      />
                      <PlannerItem
                        event={event}
                        setCloseupID={setCloseupID}
                        setEventDialogOpen={setEventDialogOpen}
                        height={eventDurationHours * 100}
                        registration={registration}
                      />
                    </div>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <>
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <EventDialog id={closeupID} open={eventDialogOpen} />
      </Dialog>

      <div className="hidden lg:flex lg:flex-row lg:space-x-4 lg:space-y-0 md:space-y-4">
        {weeks.map(renderWeek)}
      </div>

      {totalWeeks > 1 && (
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <div className="flex flex-row items-center space-x-2">
            <Button
              className="size-8 rounded-full"
              variant="outline"
              aria-label="Previous Week"
              onClick={() =>
                setCurrentWeekIndex((idx) =>
                  idx > 0 ? idx - 1 : totalWeeks - 1
                )
              }
            >
              <ChevronLeft />
            </Button>
            <p className="text-muted-foreground text-xs">Vorherige Woche</p>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <p className="text-muted-foreground text-xs">Nächste Woche</p>
            <Button
              className="size-8 rounded-full"
              variant="outline"
              aria-label="Next Week"
              onClick={() =>
                setCurrentWeekIndex((idx) =>
                  idx < totalWeeks - 1 ? idx + 1 : 0
                )
              }
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
      <div className="lg:hidden">
        {renderWeek(weeks[currentWeekIndex], currentWeekIndex)}
      </div>
    </>
  );
}
