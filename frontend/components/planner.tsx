import { Event } from "@/lib/gql/generated/graphql";
import {
  calculateEventDurationInHours,
  formatDateToDDMM,
  formatDateToHHMM,
  getISOWeekNumber,
  groupEvents,
  hexToRGBA,
  slugify,
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
import { Clock, SquareCheckBig } from "lucide-react";
import { RoomHoverCard } from "./room-hover-card";
import {usePathname, useRouter} from "next/navigation";

interface PlannerProps {
  events: Event[];
}

export function Planner({ events }: PlannerProps) {
  const { user } = useUser();

  const router = useRouter()
  const pathname = usePathname()

  const groupedEvents = groupEvents(events);
  const [currentMinutes, setCurrentMinutes] = useState(0);

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
                            <li
                              className={`rounded-lg p-2 cursor-pointer hover:outline hover:outline-offset-2 hover:outline-gray-300 hover:outline-1 transition-opacity flex flex-row justify-between`}
                              style={{
                                backgroundColor: hexToRGBA(
                                  event.topic.color ?? "#FFF",
                                  0.3
                                ),
                                height: `${eventDurationHours * 100}px`,
                              }}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                router.push(`event/${slugify(event.title)}-${event.ID}`)
                              }}
                            >
                              <div className="flex flex-row">
                                <div
                                  className="h-full w-1 rounded-lg mr-2"
                                  style={{
                                    backgroundColor:
                                      event.topic.color ?? "#FFF",
                                  }}
                                />

                                <div>
                                  <p className="text-sm font-bold">
                                    {event.title}
                                  </p>
                                  <div className="flex flex-row items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <p className="text-sm">
                                      {formatDateToHHMM(new Date(event.from))} -{" "}
                                      {formatDateToHHMM(new Date(event.to))}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {registration && (
                                <div className="flex flex-row space-x-2 mt-2 w-fit h-fit py-1 px-2 rounded-lg text-black bg-white border-l-4 border-green-500">
                                  <SquareCheckBig className="w-4 h-4 text-green-700" />
                                  <RoomHoverCard room={registration.room} />
                                </div>
                              )}
                            </li>
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
