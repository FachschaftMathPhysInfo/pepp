"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlannerEventsDocument,
  PlannerEventsQuery,
  PlannerEventsQueryVariables,
  UmbrellasDocument,
  UmbrellasQuery,
  UmbrellasQueryVariables,
} from "@/lib/gql/generated/graphql";
import { client } from "@/lib/graphClient";
import React, { useCallback, useEffect, useState } from "react";
import { Check, ChevronsUpDown, Copy, CopyCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EventDialog from "./event-dialog";
import Filter from "@/components/filter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { set } from "zod";
import { Tabs } from "@radix-ui/react-tabs";

type GroupedEvents = {
  [week: number]: {
    [day: string]: PlannerEventsQuery["events"];
  };
};

const groupEvents = (events: PlannerEventsQuery["events"]): GroupedEvents => {
  const groupedEvents: GroupedEvents = {};

  events.forEach((event) => {
    const date = new Date(event.from);
    const week = getISOWeekNumber(date);
    const day = date.toLocaleString(undefined, { weekday: "long" });

    if (!groupedEvents[week]) {
      groupedEvents[week] = {};
    }

    if (!groupedEvents[week][day]) {
      groupedEvents[week][day] = [];
    }

    groupedEvents[week][day].push(event);
  });

  return groupedEvents;
};

const getISOWeekNumber = (date: Date): number => {
  const tempDate = new Date(date.getTime());

  tempDate.setHours(12, 0, 0, 0);

  const dayOfWeek = tempDate.getDay();
  const dayDiff = (dayOfWeek + 6) % 7;

  tempDate.setDate(tempDate.getDate() - dayDiff + 3);

  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);

  const diff = tempDate.getTime() - firstThursday.getTime();

  const oneDay = 86400000;
  const daysSinceFirstThursday = Math.floor(diff / oneDay);

  return 1 + Math.floor(daysSinceFirstThursday / 7);
};

const formatDateToDDMM = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
};

const calculateEventDurationInHours = (from: string, to: string) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const durationMs = toDate.getTime() - fromDate.getTime();
  return durationMs / (1000 * 60 * 60);
};

export default function Planner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [umbrellas, setUmbrellas] = useState<UmbrellasQuery["umbrellas"]>([]);
  const [events, setEvents] = useState<PlannerEventsQuery["events"]>([]);
  const [umbrella, setUmbrella] = useState<number>(
    parseInt(searchParams.get("e") ?? "0")
  );
  const [types, setTypes] = useState<PlannerEventsQuery["typeLabels"]>([]);
  const [topics, setTopics] = useState<PlannerEventsQuery["topicLabels"]>([]);
  const [loading, setLoading] = useState(true);
  const [toFilter, setToFilter] = useState<string[]>(searchParams.getAll("to"));
  const [tyFilter, setTyFilter] = useState<string[]>(searchParams.getAll("ty"));
  const [umbrellaSelectionOpen, setUmbrellaSelectionOpen] = useState(false);
  const [popupId, setPopupId] = useState(0);
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [tabs, setTabs] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [icalPath, setIcalPath] = useState<string>()

  const groupedEvents = groupEvents(events);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(icalPath ?? "");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("failed to copy text:", err);
    }
  };

  const createQueryString = useCallback(
    (name: string, values: string[]) => {
      const params = new URLSearchParams(values.map((v) => [name, v]));

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const intervalId = setInterval(() => {
      setCurrentMinutes(currentMinutes);
    }, 60000);

    setCurrentMinutes(currentMinutes);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setTabs(newWidth / Object.keys(groupedEvents).length < 280);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const vars: PlannerEventsQueryVariables = {
        umbrellaID: umbrella,
        topic: toFilter.length == 0 ? undefined : toFilter,
        type: tyFilter.length == 0 ? undefined : tyFilter,
      };

      await new Promise((resolve) => setTimeout(resolve, 250));

      const eventData = await client.request<PlannerEventsQuery>(
        PlannerEventsDocument,
        vars
      );

      if (eventData.events.length) {
        if (eventData.typeLabels.length >= 2) {
          setTypes(eventData.typeLabels);
        }
        if (eventData.topicLabels.length >= 2) {
          setTopics(eventData.topicLabels);
        }
        setEvents(eventData.events);
        setLoading(false);
      }
    };

    router.push(
      pathname +
        "?" +
        createQueryString("e", [umbrella.toString()]) +
        (toFilter.length ? "&" : "") +
        createQueryString("to", toFilter) +
        (tyFilter.length ? "&" : "") +
        createQueryString("ty", tyFilter)
    );
    fetchData();
  }, [toFilter, tyFilter, umbrella]);

  useEffect(() => {
    setIcalPath(window.location.origin + "/ical/?" + searchParams)
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const vars: UmbrellasQueryVariables = {
        onlyFuture: true,
      };

      const umbrellaData = await client.request<UmbrellasQuery>(
        UmbrellasDocument,
        vars
      );
      if (umbrellaData.umbrellas.length) {
        setUmbrellas(umbrellaData.umbrellas);
        if (!umbrella) setUmbrella(umbrellaData.umbrellas[0].ID);
      }
    };

    fetchData();
  }, [umbrella]);

  return (
    <div className="space-y-6 min-h-screen flex-col p-8">
      <div className="flex flex-row">
        <Popover
          open={umbrellaSelectionOpen}
          onOpenChange={setUmbrellaSelectionOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              role="combobox"
              aria-expanded={umbrellaSelectionOpen}
              className="w-auto h-auto justify-between text-4xl font-bold"
            >
              {umbrellas.find((u) => u.ID == umbrella)?.title ??
                "Event auswählen..."}
              <ChevronsUpDown className="ml-8 h-7 w-7 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Event suchen..." />
              <CommandList>
                <CommandEmpty>Kein Event gefunden.</CommandEmpty>
                <CommandGroup>
                  {umbrellas.map((u) => (
                    <CommandItem
                      key={u.ID}
                      value={u.title}
                      onSelect={() => {
                        setUmbrella(u.ID);
                        setUmbrellaSelectionOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          umbrella === u.ID ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {u.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="w-full" />

        <div className="relative border rounded-lg p-2 flex flex-row min-w-[300px] overflow-hidden">
          <div>
            <p className="text-xs font-bold text-muted-foreground">
              ICS-Kalender
            </p>
            <p className="text-sm truncate">{icalPath}</p>
          </div>
          <Button
            onClick={() => handleCopy()}
            className="absolute right-2"
            variant="secondary"
            size="icon"
          >
            {isCopied ? (
              <CopyCheck className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {events.length > 0 && (
        <div className="space-y-2">
          <Filter
            title="Thema"
            options={topics.map((t) => t.name)}
            filter={toFilter}
            setFilter={setToFilter}
          />
          <Filter
            title="Veranstaltungsart"
            options={types.map((t) => t.name)}
            filter={tyFilter}
            setFilter={setTyFilter}
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
      ) : (
        <div>
          <div className="flex flex-row space-x-4">
            {Object.entries(groupedEvents).map(([week, days], weekIndex) => (
              <div key={week} className="space-y-4 flex-1">
                {Object.keys(groupedEvents).length > 1 && (
                  <h2 className="text-2xl font-semibold text-center">
                    Woche {weekIndex + 1}
                  </h2>
                )}
                {Object.entries(days).map(([day, dayEvents]) => {
                  const dayStartDate = new Date(dayEvents[0].from);
                  const dayEndDate = new Date(
                    dayEvents[dayEvents.length - 1].to
                  );
                  const now = new Date();
                  const tPosition = () => {
                    const startTime =
                      dayStartDate.getHours() * 60 + dayStartDate.getMinutes();
                    const endTime =
                      dayEndDate.getHours() * 60 + dayEndDate.getMinutes();

                    const progress =
                      ((currentMinutes - startTime) / (endTime - startTime)) *
                      100;

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
                              calculateEventDurationInHours(
                                event.from,
                                event.to
                              );

                            return (
                              <div key={event.ID}>
                                <div
                                  className="bg-transparent"
                                  style={{ height: `${gap * 100}px` }}
                                ></div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <li
                                      key={event.ID}
                                      className={`rounded-lg p-4 text-white cursor-pointer hover:opacity-90 transition-opacity`}
                                      style={{
                                        backgroundColor: event.topic.color,
                                        height: `${eventDurationHours * 100}px`,
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => setPopupId(event.ID)}
                                    >
                                      <p className="text-sm font-bold">
                                        {event.title}
                                      </p>
                                      <p className="text-sm">
                                        {new Date(
                                          event.from
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(event.to).toLocaleTimeString(
                                          [],
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </p>
                                    </li>
                                  </DialogTrigger>
                                  <EventDialog id={popupId} />
                                </Dialog>
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
        </div>
      )}
    </div>
  );
}
