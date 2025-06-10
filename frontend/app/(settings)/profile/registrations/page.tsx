"use client";

import {
  Event,
  GetTutorialIdsOfEventDocument,
  GetTutorialIdsOfEventQuery,
} from "@/lib/gql/generated/graphql";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useState, useCallback } from "react";
import { getClient } from "@/lib/graphql";
import { useUser } from "@/components/providers";
import { Dialog } from "@/components/ui/dialog";
import PlannerItem from "@/components/planner-item";
import EventDialog from "@/components/event-dialog/event-dialog";
import { defaultEvent } from "@/types/defaults";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function RegistrationsPage() {
  const { user, sid } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [closeupID, setCloseupID] = useState(0);

  const fetchRegisteredEvents = useCallback(async () => {
    if (!user) return;
    const client = getClient(String(sid));
    const registeredEventIds = user.registrations?.map((r) => r.event?.ID);

    if (!registeredEventIds || registeredEventIds.length === 0) {
      setEvents([]);
      return;
    }

    const registeredTutorialIds = user.registrations?.map((r) => r.ID);

    const { events } = await client.request<GetTutorialIdsOfEventQuery>(
      GetTutorialIdsOfEventDocument,
      { ids: registeredEventIds }
    );

    const filteredEvents = events
      .map((event: any) => ({
        ...defaultEvent,
        ...event,
      }))
      .filter(
        (event: { tutorials: any[] }) =>
          Array.isArray(event.tutorials) &&
          event.tutorials.some((tutorial: { ID: number }) =>
            registeredTutorialIds?.includes(tutorial.ID)
          )
      );

    setEvents(filteredEvents as Event[]);
  }, [user, sid]);

  useEffect(() => {
    void fetchRegisteredEvents();
  }, [fetchRegisteredEvents]);

  if (events.length === 0) {
    return (
      <div className={"w-full p-10 rounded-lg"}>
        Noch hast du dich zu keiner Veranstaltung angemeldet.
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Anmeldungen</CardTitle>
        <CardDescription>
          Du bist zu folgenden Veranstaltungen anmelden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <EventDialog id={closeupID} open={eventDialogOpen} />
        </Dialog>
        <Accordion type="multiple">
          {Object.entries(
            events.reduce((pickedEventsByUmbrella, event) => {
              const key = event.umbrella?.ID || "Sonstige";
              const label = event.umbrella?.title || "Sonstige";
              if (!pickedEventsByUmbrella[key]) {
                pickedEventsByUmbrella[key] = { label, events: [] };
              }
              pickedEventsByUmbrella[key].events.push(event);
              return pickedEventsByUmbrella;
            }, {} as Record<string, { label: string; events: Event[] }>)
          ).map(([umbrellaID, groupedEvents]) => (
            <AccordionItem key={umbrellaID} value={umbrellaID}>
              <AccordionTrigger className={"hover:no-underline"}>
                {groupedEvents.label}
              </AccordionTrigger>
              <AccordionContent>
                {groupedEvents.events.map((event) => (
                  <PlannerItem
                    key={event.ID}
                    event={event}
                    setCloseupID={setCloseupID}
                    setEventDialogOpen={setEventDialogOpen}
                    height={70}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
