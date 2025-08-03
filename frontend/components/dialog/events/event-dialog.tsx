"use client";

import {
  Event,
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  Role,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { Edit3, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRefetch, useUser } from "../../providers";
import { getClient } from "@/lib/graphql";
import { TutorialsTable } from "./tutorials-table";
import {
  defaultEvent,
  defaultTutorial,
  defaultUser,
  defaultForm,
} from "@/types/defaults";
import { Button } from "../../ui/button";
import { EditEventView } from "./edit-event-view";
import EventDescription from "./event-description";
import { AuthenticationDialog } from "../authentication/authentication-dialog";
import Link from "next/link";
import { extractId, slugify } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface EventDialogProps {
  id?: number;
  modify?: boolean;
  open: boolean;
  closeDialogAction?: () => void;
}

export default function EventDialog({
  id,
  modify = false,
  open,
  closeDialogAction,
}: EventDialogProps) {
  const { user } = useUser();
  const { refetchKey } = useRefetch();

  const pathname = usePathname();

  const [event, setEvent] = useState<Event>();
  const [edit, setEdit] = useState(modify);
  const [authenticationDialogOpen, setAuthenticationDialogOpen] =
    useState(false);

  const application = user?.applications?.find(
    (a) => a.event.ID === event?.umbrella?.ID
  );
  const isRestricted = !!event?.umbrella?.registrationForm

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
          umbrella: {
            ...defaultEvent,
            ...e.umbrella,
            registrationForm: {
              ...defaultForm,
              ...e.umbrella?.registrationForm,
            },
          },
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
    <EditEventView event={event} closeDialogAction={closeDialogAction} />
  ) : (
    <>
      <DialogContent className="sm:min-w-[600px]">
        {!event && id ? (
          <div className="flex flex-col space-y-3">
            {/*For Screen-Readers, won't be shown*/}
            <VisuallyHidden>
              <DialogTitle>Ladende Eventansicht</DialogTitle>
            </VisuallyHidden>
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-3 w-[200px]" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{event?.title}</DialogTitle>
              <div className="text-sm text-muted-foreground space-y-2">
                <EventDescription event={event} />
              </div>
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

            {isRestricted && (
              <>
                {!application?.accepted && (
                  <div className="flex flex-row space-x-2">
                    <Info className="size-5 text-yellow-500" />
                    <p className="text-muted-foreground text-sm">
                      Bitte warte bis wir deine Bewerbung überprüft haben. Du
                      erhälst zeitnah eine E-Mail wie es weiter geht.
                    </p>
                  </div>
                )}
              </>
            )}

            <TutorialsTable
              id={id!}
              event={event!}
              capacities={
                event?.tutorials?.map((t) => t.room.capacity ?? 1) || []
              }
              edit={false}
              tutorials={event?.tutorials ?? []}
              setTutorialsAction={() => {}}
            />
            {user?.role === Role.Admin && (
              <Button variant="secondary" onClick={() => setEdit(true)}>
                <Edit3 className="h-4 w-4" />
                Bearbeiten
              </Button>
            )}
          </div>
        )}

        {id && event?.umbrella?.ID !== extractId(pathname) && (
          <div className="flex flex-row items-center">
            <Info className="size-4 mr-2" />
            <span className="text-xs">
              Diese Veranstaltung ist Teil von{" "}
              <Link
                className="underline"
                href={`/${slugify(event?.umbrella?.title ?? "")}-${
                  event?.umbrella?.ID
                }`}
              >
                {event?.umbrella?.title}
              </Link>
              .
            </span>
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
