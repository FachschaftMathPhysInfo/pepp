"use client";

import {
  Event,
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  Role,
  TutorialToUserAssignment,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Dialog,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useUser } from "../providers";
import { getClient } from "@/lib/graphql";
import { TutorialsTable } from "./tutorials-table";
import { FullDateDescription } from "../full-date-description";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import { Button } from "../ui/button";
import Link from "next/link";

interface EventDialogProps {
  id?: number;
  modify?: boolean;
}

export default function EventDialog({
  id,
  modify = false,
}: EventDialogProps) {
  const { user } = useUser();
  const [event, setEvent] = useState<Event>();
  const [edit, setEdit] = useState(modify);
  const [newAssignments, setNewAssignments] = useState<TutorialToUserAssignment[]>(
    []
  );
  const [deleteAssignments, setDeleteAssignments] = useState<
    TutorialToUserAssignment[]
  >([]);

  useEffect(() => {
    const fetchEventData = async () => {
      const client = getClient();
      const vars: EventCloseupQueryVariables = {
        id: id!,
      };

      const eventData = await client.request<EventCloseupQuery>(
        EventCloseupDocument,
        vars
      );

      if (eventData.events.length) {
        const e = eventData.events[0];
        setEvent({
          ...defaultEvent,
          ...e,
          tutorials: e.tutorials?.map((t) => ({
            ...defaultTutorial,
            ...t,
            event: { ...defaultEvent, ID: id! },
            tutors: t.tutors?.map((tu) => ({ ...defaultUser, ...tu })),
          })),
        });
      }
    };

    if (id) fetchEventData();
  }, [id]);

  return (
    <Dialog
    >
      <DialogContent className="sm:min-w-[600px]">
        {!event && id ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-3 w-[200px]" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
          </div>
        ) : edit ? (
<<<<<<< HEAD
                <></>
=======
          <EditEventView event={event} />
>>>>>>> f2eb4f18cb0bac3187e10675dee17502157416ef
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{event?.title}</DialogTitle>
              <DialogDescription className="space-y-2">
                <p>{event?.description}</p>
                <div className="space-x-2 flex flex-row">
                  <Badge variant="event" color={event?.topic.color || ""}>
                    {event?.topic.name}
                  </Badge>
                  <Badge variant="event" color={event?.type.color || ""}>
                    {event?.type.name}
                  </Badge>
                </div>
                {event && (
                  <FullDateDescription
                    from={new Date(event.from)}
                    to={new Date(event.to)}
                  />
                )}
              </DialogDescription>
            </DialogHeader>

            {!user && event?.tutorials?.length && (
              <div>
                <span>Bitte </span>
                <Link href="/login">anmelden</Link>
                <span>, um dich eintragen zu können.</span>
              </div>
            )}
            <TutorialsTable
              id={id!}
              event={event!}
              capacities={
                event?.tutorials?.map((t) => t.room.capacity ?? 1) || []
              }
              edit={false}
              newAssignments={newAssignments}
              setNewAssignments={setNewAssignments}
              deleteAssignments={deleteAssignments}
              setDeleteAssignments={setDeleteAssignments}
            />
            {user?.role === Role.Admin && (
              <Button variant="secondary" onClick={() => setEdit(true)}>
                <Edit3 className="h-4 w-4" />
                Bearbeiten
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
