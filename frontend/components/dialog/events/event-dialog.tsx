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
} from "@/components/ui/dialog";
import { useRefetch, useUser } from "../../providers";
import { getClient } from "@/lib/graphql";
import { TutorialsTable } from "./tutorials-table";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import { Button } from "../../ui/button";
import { EditEventView } from "./edit-event-view";
import EventDescription from "./event-description";
import { AuthenticationDialog } from "../authentication/authentication-dialog";

interface EventDialogProps {
  id?: number;
  modify?: boolean;
  open: boolean;
}

export default function EventDialog({
  id,
  modify = false,
  open,
}: EventDialogProps) {
  const { user } = useUser();
  const { refetchKey } = useRefetch();

  const [event, setEvent] = useState<Event>();
  const [edit, setEdit] = useState(modify);
  const [newAssignments, setNewAssignments] = useState<
    TutorialToUserAssignment[]
  >([]);
  const [deleteAssignments, setDeleteAssignments] = useState<
    TutorialToUserAssignment[]
  >([]);
  const [authenticationDialogOpen, setAuthenticationDialogOpen] =
    useState(false);

  useEffect(() => {
    if (!open && id) setEdit(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (id === event?.ID) return;

    setEvent(undefined);

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

    if (id) void fetchEventData();
  }, [id, open, refetchKey]);

  return edit ? (
    <EditEventView event={event} />
  ) : (
    <>
      <DialogContent className="sm:min-w-[600px]">
        {!event && id ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-3 w-[200px]" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{event?.title}</DialogTitle>
              <DialogDescription className="space-y-2">
                <EventDescription event={event} />
              </DialogDescription>
            </DialogHeader>

            {!user && event?.tutorials?.length && (
              <div>
                <span>Bitte </span>
                <span
                  className="cursor-pointer text-blue-500 hover:underline"
                  onClick={() => setAuthenticationDialogOpen(true)}
                >
                  anmelden
                </span>
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

      <AuthenticationDialog
        open={authenticationDialogOpen}
        closeDialog={() => setAuthenticationDialogOpen(false)}
      />
    </>
  );
}
