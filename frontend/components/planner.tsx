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

interface PlannerProps {
  events: Event[];
}

export function Planner({ events }: PlannerProps) {
  const { user } = useUser();

  const groupedEvents = groupEvents(events);
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [closeupID, setCloseupID] = useState(0);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const intervalId = setInterval(() => {
      setCurrentMinutes(currentMinutes);
    }, 60000);

    setCurrentMinutes(currentMinutes);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <EventDialog id={closeupID} open={eventDialogOpen}/>
      </Dialog>
      <div className="lg:flex lg:flex-row lg:space-x-4 lg:space-y-0 md:space-y-4">
        {Object.entries(groupedEvents).map(([week, days], weekIndex) => (
          <div key={week} className="space-y-4 flex-1">
            {Object.keys(groupedEvents).length > 1 && (
              <h2 className="text-2xl font-semibold text-center">
                Woche {weekIndex + 1}
              </h2>
            )}
            {Object.entries(days).map(([day, dayEvents]) => {
              const dayStartDate = new Date(dayEvents[0].from);
              const dayEndDate = new Date(dayEvents[dayEvents.length - 1].to);
              const now = new Date();
              const tPosition = () => {
                const startTime =
                  dayStartDate.getHours() * 60 + dayStartDate.getMinutes();
                const endTime =
                  dayEndDate.getHours() * 60 + dayEndDate.getMinutes();

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
                    {dayStartDate.getDay() == now.getDay() &&
                      getISOWeekNumber(dayStartDate) ===
                        getISOWeekNumber(now) && (
                        <div className="relative w-2 mr-[24px]">
                          <div className="absolute inset-0 w-0.5 bg-gray-300 mx-auto"></div>
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
                        const eventDurationHours =
                          calculateEventDurationInHours(event.from, event.to);
                        const registration = user?.registrations?.find(
                          (r) => r.event.ID === event.ID
                        );

                        return (
                          <div key={event.ID}>
                            <div
                              className="bg-transparent"
                              style={{ height: `${gap * 100}px` }}
                            ></div>
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
        ))}
      </div>
    </>
  );
}
