"use client";

import {
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
} from "@/lib/gql/generated/graphql";
import { client } from "@/lib/graphClient";
import React, { useEffect, useState } from "react";
import { Mail, Building2, ArrowDownToDot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import MapPreview from "@/components/map-preview";

export default function EventDialog({ id }: { id: number }) {
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
                            <div className="group">
                              <p className="text-xs text-muted-foreground group-hover:underline">
                                {e.room?.building.name}
                              </p>
                              <p className="group-hover:underline">
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
                                  {e.room?.name && (
                                    <p className="text-xs text-muted-foreground">
                                      {e.room?.number}
                                    </p>
                                  )}
                                  {e.room?.floor !== null && (
                                    <p className="text-xs text-muted-foreground">
                                      Ebene {e.room?.floor}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <MapPreview
                              height="100%"
                              width="100%"
                              latitude={e.room?.building.latitude ?? 0}
                              longitude={e.room?.building.longitude ?? 0}
                              zoom={e.room?.building.zoomLevel}
                              className="rounded-tr-lg rounded-br-lg"
                            />
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <p>
                          {registrations}/{capacity}
                        </p>
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
