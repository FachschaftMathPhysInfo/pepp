"use client";

import {
  Event,
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  EventToUserAssignment,
  Role,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SignInDialog } from "@/components/sign-in-dialog";
import { useUser } from "../providers";
import { getClient } from "@/lib/graphql";
import { TutorialsTable } from "./tutorials-table";
import { FullDateDescription } from "../full-date-description";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import { Button } from "../ui/button";
import { EditEventView } from "./edit-event-view";

interface EventDialogProps {
  id?: number;
  modify?: boolean;
  children: React.ReactNode;
}

export default function EventDialog({
  id,
  modify = false,
  children,
}: EventDialogProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(id ? true : false);
  const [event, setEvent] = useState<Event>();
  const [edit, setEdit] = useState(modify);
  const [open, setOpen] = useState(false);
  const [newAssignments, setNewAssignments] = useState<EventToUserAssignment[]>(
    []
  );
  const [deleteAssignments, setDeleteAssignments] = useState<
    EventToUserAssignment[]
  >([]);

  useEffect(() => {
    setLoading(true);
    const client = getClient();

    const fetchEventData = async () => {
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
            tutors: t.tutors.map((tu) => ({ ...defaultUser, ...tu })),
          })),
        });
      }
    };

    if (id) fetchEventData()
    setLoading(false);
  }, [id]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open && id) {
          setEdit(false);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:min-w-[600px]">
        {loading ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-3 w-[200px]" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
          </div>
        ) : edit ? (
          <EditEventView event={event} setOpen={setOpen} />
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
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="cursor-pointer text-blue-500 hover:underline">
                      anmelden
                    </span>
                  </DialogTrigger>
                  <SignInDialog />
                </Dialog>
                <span>, um dich eintragen zu können.</span>
              </div>
            )}
            <TutorialsTable
              id={id!}
              event={event!}
              tutorials={event?.tutorials ?? []}
              capacities={
                event?.tutorials?.map((t) => t.room.capacity ?? 1) || []
              }
              edit={edit}
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
