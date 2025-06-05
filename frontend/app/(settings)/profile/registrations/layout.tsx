"use client";

import { Separator } from "@/components/ui/separator";
import {
  RegisteredEventsDocument,
  RegisteredEventsQuery,
  TutorialToUserAssignment,
  RegisteredTutorialsDocument,
  RegisteredEventIdsOfUserDocument,
  RegisteredEventIdsOfUserQuery,
  RegisteredTutorialsQuery,
  Event,
  TableEventsDocument,
  TableEventsQuery,
  GetTutorialIdsOfEventDocument,
  GetTutorialIdsOfEventQuery,
  Tutorial,
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

import { defaultEvent, defaultTutorial } from "@/types/defaults";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { title } from "process";

export default function Registrations() {
  const { user, sid } = useUser();
  const [events, setEvents] = useState<Event[]>([]);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [closeupID, setCloseupID] = useState(0);

  const fetchRegisteredEvents = useCallback(async () => {
    if (user !== null) {
      const client = getClient(String(sid));

      const lecturesData = await client.request<GetTutorialIdsOfEventQuery>(
        GetTutorialIdsOfEventDocument
      );

      const registeredLectures = lecturesData.events.map((e) => ({
        ...defaultEvent,
        ...e,
      }));

      const registeredTutorialsData =
        await client.request<RegisteredEventIdsOfUserQuery>(
          RegisteredEventIdsOfUserDocument,
          { mail: user.mail }
        );

      const registeredTutorials = registeredTutorialsData.users.map(
        (u) => u.registrations
      );

      const registeredIds = registeredTutorials.flatMap((usersEventList) =>
        (usersEventList || []).map((event) => event.ID)
      );

      const filteredTutorials = registeredLectures.filter(
        (event) =>
          Array.isArray(event.tutorials) &&
          event.tutorials.some((tutorial) =>
            registeredIds.includes(tutorial.ID)
          )
      );

      if (!registeredTutorials) {
        setEvents([]);
        return;
      }

      setEvents(filteredTutorials as Event[]);
    }
  }, [user, sid]);

  useEffect(() => {
    void fetchRegisteredEvents();
  }, [fetchRegisteredEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">Veranstaltungsverwaltung</h3>
        <p className="text-sm text-muted-foreground">
          Bearbeite deine Anmeldungen zu Veranstaltungen.
        </p>
      </div>
      {events.length === 0 ? (
        <div className={"w-full p-10  rounded-lg"}>
          Noch hast du dich zu keiner Veranstaltung angemeldet.
        </div>
      ) : (
        <>
          <div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Anmeldungen</CardTitle>
                <CardDescription>
                  Du bist zu folgenden Veranstaltungen anmelden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog
                  open={eventDialogOpen}
                  onOpenChange={setEventDialogOpen}
                >
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
          </div>
        </>
      )}
    </div>
  );
}
