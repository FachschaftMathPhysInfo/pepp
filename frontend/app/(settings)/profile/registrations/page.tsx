"use client";

import {
  Event,
  GetTutorialIdsOfEventDocument,
  GetTutorialIdsOfEventQuery,
  PlannerEventsDocument,
} from "@/lib/gql/generated/graphql";

import {Card, CardContent} from "@/components/ui/card";

import {useCallback, useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {useUser} from "@/components/providers";
import PlannerItem from "@/components/planner-item";
import {EventDialog} from "@/components/dialog/events/event-dialog";
import {defaultEvent} from "@/types/defaults";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";

export default function RegistrationsPage() {
  const {user, sid} = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEventID, setSelectedEventID] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchRegisteredEvents = useCallback(async () => {
    if (!user) return;
    const client = getClient(String(sid));
    const registeredEventIds = user.registrations?.map((r) => r.event?.ID);

    if (!registeredEventIds || registeredEventIds.length === 0) {
      setEvents([]);
      return;
    }

    const registeredTutorialIds = user.registrations?.map((r) => r.ID);

    const {events} = await client.request<GetTutorialIdsOfEventQuery>(
      GetTutorialIdsOfEventDocument,
      {ids: registeredEventIds}
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

  // FIXME: Yes this is a duplicate from the header. Will be fixed later on maybe...
  //  also looking at this file, this is not the worst problem here
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!selectedEventID) return

      const umbrellaID = events.find(event => !!event.umbrella)?.umbrella?.ID
      if (!umbrellaID) return

      const client = getClient();
      const data = await client.request(
        PlannerEventsDocument,
        {umbrellaID: umbrellaID}
      )

      const fetchedEvents = data.events.map(event => ({
        ...defaultEvent,
        ...event,
      }))

      setSelectedEvent(fetchedEvents[0] ?? null)
    }

    void fetchEventDetails();
  }, [selectedEventID]);

  if (events.length === 0) {
    return (
      <div className={"w-full p-10 justify-center text-center"}>
        Noch hast du dich zu keiner Veranstaltung angemeldet.
      </div>
    );
  }

  return (
    <>
      <Card className="mt-4">
        <CardContent>
          <Accordion type="multiple">
            {Object.entries(
              events.reduce((pickedEventsByUmbrella, event) => {
                const key = event.umbrella?.ID || "Sonstige";
                const label = event.umbrella?.title || "Sonstige";
                if (!pickedEventsByUmbrella[key]) {
                  pickedEventsByUmbrella[key] = {label, events: []};
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
                      setCloseupID={setSelectedEventID}
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

      <EventDialog
        event={selectedEvent}
        isOpen={eventDialogOpen}
        onCloseAction={() => setEventDialogOpen(false)}
      />
    </>
  );
}
