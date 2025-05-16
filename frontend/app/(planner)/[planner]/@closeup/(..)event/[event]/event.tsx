"use client";

import {
  Event,
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  Role,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { getClient } from "@/lib/graphql";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import Modal from "@/components/modal";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/components/providers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Edit3 } from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {EventDescription, TutorialsTable} from "@/components/event";

export default function PlannerEventModal({ id }: { id: number }) {
  const [event, setEvent] = useState<Event>();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

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
            event: { ...defaultEvent, ID: id },
            tutors: t.tutors?.map((tu) => ({ ...defaultUser, ...tu })),
          })),
        });
      }
    };

    fetchEventData();
  }, []);

  return (
    <Modal>
      {event ? (
        <>
          <DialogHeader>
            <DialogTitle>{event?.title}</DialogTitle>
            <DialogDescription>
              <EventDescription event={event} />
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!user && event?.tutorials?.length && (
              <div>
                <span>Bitte </span>
                <Link href="/login">anmelden</Link>
                <span>, um dich eintragen zu können.</span>
              </div>
            )}
            <TutorialsTable
              event={event!}
              capacities={
                event?.tutorials?.map((t) => t.room.capacity ?? 1) || []
              }
              edit={false}
            />
            {user?.role === Role.Admin && (
              <Button
                variant="secondary"
                onClick={() => router.push(`${pathname}/edit`)}
              >
                <Edit3 className="h-4 w-4" />
                Bearbeiten
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
      )}
    </Modal>
  );
}
