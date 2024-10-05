"use client";

import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  PlannerEventsDocument,
  PlannerEventsQuery,
  PlannerEventsQueryVariables,
  UmbrellasDocument,
  UmbrellasQuery,
} from "@/lib/gql/generated/graphql";
import { client } from "@/lib/graphClient";
import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronsUpDown,
  Mail,
  Building2,
  ArrowDownToDot,
} from "lucide-react";

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
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

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
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
};

const formatDateToDDMM = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
};

export default function Home() {
  const [events, setEvents] = useState<PlannerEventsQuery["events"]>([]);
  const [title, setTitle] = useState("");
  const [umbrella, setUmbrella] = useState<number>(0);
  const [umbrellas, setUmbrellas] = useState<UmbrellasQuery["umbrellas"]>([]);
  const [types, setTypes] = useState<PlannerEventsQuery["typeLabels"]>([]);
  const [topics, setTopics] = useState<PlannerEventsQuery["topicLabels"]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string[]>([]);
  const [umbrellaSelectionOpen, setUmbrellaSelectionOpen] = useState(false);
  const [popupId, setPopupId] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const vars: PlannerEventsQueryVariables = {
        umbrellaID: umbrella,
        filter: filter.length == 0 ? undefined : filter,
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

    const getUmbrellas = async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const umbrellaData = await client.request<UmbrellasQuery>(
        UmbrellasDocument
      );
      if (umbrellaData.umbrellas.length) {
        setUmbrellas(umbrellaData.umbrellas);
      }
    };

    getUmbrellas();
    fetchData();
  }, [filter, umbrella]);

  const groupedEvents = groupEvents(events);

  const calculateEventDurationInHours = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const durationMs = toDate.getTime() - fromDate.getTime();
    return durationMs / (1000 * 60 * 60);
  };

  return (
    <main>
      <Header />

      <div className="space-y-6 min-h-screen flex-col p-8">
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
              {title
                ? umbrellas.find((u) => u.title === title)?.title
                : "Event auswählen..."}
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
                        setTitle(u.title === title ? "" : u.title);
                        setUmbrella(u.ID);
                        setUmbrellaSelectionOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          title === u.title ? "opacity-100" : "opacity-0"
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

        {events.length > 0 && (
          <div className="space-y-2">
            <Filter
              title="Thema"
              options={topics.map((t) => t.name)}
              filter={filter}
              setFilter={setFilter}
            />
            <Filter
              title="Veranstaltungsart"
              options={types.map((t) => t.name)}
              filter={filter}
              setFilter={setFilter}
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
                    const currentMinutes =
                      now.getHours() * 60 + now.getMinutes();
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
                        {dayStartDate.getDay() == now.getDay() && (
                          <div className="relative w-4 mr-[24px]">
                            <div className="absolute inset-0 w-1 bg-gray-300 mx-auto"></div>
                            {now.getTime() >= dayStartDate.getTime() &&
                              now.getTime() <= dayEndDate.getTime() && (
                                <div
                                  className="absolute left-0 right-0 bg-red-500 w-4 h-4 rounded-full mx-auto"
                                  style={{ top: `${tPosition()}%` }}
                                ></div>
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
        )}
      </div>
    </main>
  );
}

function Filter({
  title,
  options,
  filter,
  setFilter,
}: {
  title: string;
  options: string[];
  filter: string[];
  setFilter: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const handleFilterChange = (f: string) => {
    setFilter((prevSelected) =>
      prevSelected.includes(f)
        ? prevSelected.filter((t) => t !== f)
        : [...prevSelected, f]
    );
  };

  return (
    <div>
      <p className="font-bold text-xs">{title}</p>
      <div className="flex flex-row space-x-4">
        {options.map((o) => (
          <label key={o} className="flex items-center space-x-2">
            <Checkbox
              checked={filter.includes(o)}
              onCheckedChange={() => handleFilterChange(o)}
            />
            <p>{o}</p>
          </label>
        ))}
      </div>
    </div>
  );
}

function EventDialog({ id }: { id: number }) {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventCloseupQuery["events"][0] | null>(
    null
  );

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);

      const vars: EventCloseupQueryVariables = {
        id: id,
      };

      await new Promise((resolve) => setTimeout(resolve, 250));

      const eventData = await client.request<EventCloseupQuery>(
        EventCloseupDocument,
        vars
      );

      if (eventData.events.length) {
        setEvent(eventData.events[0]);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <DialogContent className="sm:max-w-[550px]">
      {loading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>{event?.title}</DialogTitle>
            <DialogDescription>
              {event?.description}
              <div className="space-x-2 mt-2">
                <Badge variant="event" color={event?.topic.color}>
                  {event?.topic.name}
                </Badge>
                <Badge variant="event" color={event?.type.color}>
                  {event?.type.name}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableBody>
                {event?.tutorsAssigned?.map((e) => {
                  const registrations = e.registrations ?? 0;
                  const capacity = e.room?.capacity ?? 1;
                  const utilization = (registrations / capacity) * 100;

                  return (
                    <TableRow key={e.room?.number}>
                      <div
                        className={
                          "absolute inset-0 z-0 rounded-md bg-" +
                          (utilization < 100 ? "green" : "red") +
                          "-200"
                        }
                        style={{
                          width: `${utilization}%`,
                        }}
                      />
                      <TableCell className="relative z-10">
                        {e.tutors?.map((t) => (
                          <HoverCard key={t.mail}>
                            <HoverCardTrigger asChild>
                              <p className="hover:underline">
                                {t.fn + " " + t.sn[0] + "."}
                              </p>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="mb-1 text-xs text-muted-foreground">
                                {t.fn + " " + t.sn}
                              </p>
                              <div className="flex flex-row items-center">
                                <Mail className="mr-2 h-4 w-4 opacity-70" />
                                <a
                                  href={"mailto:" + t.mail}
                                  className="hover:underline text-blue-500"
                                >
                                  {t.mail}
                                </a>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </TableCell>
                      <TableCell className="relative z-2">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="hover:undeline">
                              <p className="text-xs text-muted-foreground">
                                {e.room?.building.name}
                              </p>
                              <p>
                                {e.room?.name ? e.room.name : e.room?.number}
                              </p>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="min-w-[400px] p-0 flex flex-row">
                            <div className="p-4 space-y-4">
                              <div className="flex flex-row space-x-2">
                                <Building2 className="h-5 w-5" />
                                <div>
                                  <p className="font-bold">
                                    {e.room?.building.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {e.room?.building.street +
                                      " " +
                                      e.room?.building.number}
                                  </p>
                                  <div className="flex flex-row space-x-1 text-xs text-muted-foreground">
                                    <p>{e.room?.building.zip},</p>
                                    <p>{e.room?.building.city}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-row space-x-2">
                                <ArrowDownToDot className="h-5 w-5" />
                                <div>
                                  <p className="font-bold">
                                    {e.room?.name
                                      ? e.room.name
                                      : e.room?.number}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Ebene {e.room?.floor}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <iframe
                              className="rounded-tr-lg rounded-br-lg"
                              height="100%"
                              width="100%"
                              src="https://www.openstreetmap.org/export/embed.html?bbox=8.674038648605348%2C49.41641767965658%2C8.675851821899416%2C49.41860402680603&amp;layer=mapnik"
                            ></iframe>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <div>
                          <span>{registrations}</span>
                          <span>/</span>
                          <span>{e.room?.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <Button disabled={utilization == 100} variant="outline">
                          Eintragen
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DialogContent>
  );
}
