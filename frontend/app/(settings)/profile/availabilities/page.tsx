"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AddEventAvailabilityOfTutorDocument,
  AddEventAvailabilityOfTutorMutation,
  AvailableEventIdsOfUserDocument,
  AvailableEventIdsOfUserQuery,
  DeleteEventAvailabilityOfTutorDocument,
  DeleteEventAvailabilityOfTutorMutation,
  Event,
  TableEventsDocument,
  TableEventsQuery,
} from "@/lib/gql/generated/graphql";
import { useUser } from "@/components/providers";
import { getClient } from "@/lib/graphql";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EventTable } from "@/components/tables/event-table/event-table";
import { eventColumns } from "@/components/tables/event-table/event-columns";
import { RowSelectionState } from "@tanstack/react-table";
import { defaultEvent } from "@/types/defaults";
import { BadgeX, RotateCcw, Save } from "lucide-react";
import { GraphQLClient } from "graphql-request";
import { toast } from "sonner";
import {
  createRowSelectionFromEventIds,
  getEventIdsFromRowSelection,
} from "@/lib/utils/tableUtils";

export default function Settings() {
  const { user, sid } = useUser();
  const [client, setClient] = useState<GraphQLClient>(getClient());
  const [events, setEvents] = useState<Event[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [previousEventIds, setPreviousEventIds] = useState<number[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [hasSelectionChangedFromInit, setHasSelectionChangedFromInit] =
    useState<boolean>(false);
  const fetchEvents = useCallback(async () => {
    if (user) {
      const futureEventsData = await client.request<TableEventsQuery>(
        TableEventsDocument,
        {
          needsTutors: true,
          onlyFuture: true,
        }
      );
      const futureEvents: Event[] = futureEventsData.events.map((e) => ({
        ...defaultEvent,
        ...e,
      }));

      const availableEventsData =
        await client.request<AvailableEventIdsOfUserQuery>(
          AvailableEventIdsOfUserDocument,
          { mail: user.mail }
        );
      const availableEvents = availableEventsData.users.map(
        (u) => u.availabilities
      );
      const initialIds = availableEvents.flatMap((usersEventList) =>
        (usersEventList || []).map((event) => event.ID)
      );

      setPreviousEventIds(initialIds);
      setEvents(futureEvents);
      setRowSelection(createRowSelectionFromEventIds(initialIds));
      setSelectedEventIds(initialIds);
    }
  }, [client, user]);

  useEffect(() => {
    if (sid) setClient(getClient(sid));
  }, [sid]);

  useEffect(() => {
    if (sid) void fetchEvents();
  }, [fetchEvents, sid]);

  useEffect(() => {
    const newIds = getEventIdsFromRowSelection(rowSelection);
    setSelectedEventIds(newIds);
    setHasSelectionChangedFromInit(
      !(String(newIds) == String(previousEventIds))
    );
  }, [previousEventIds, rowSelection]);

  async function onSubmit() {
    console.log("in Submit: ", selectedEventIds);
    const idsToRemove: number[] = previousEventIds.filter(
      (id) => !selectedEventIds.includes(id)
    );
    const idsToAdd: number[] = selectedEventIds.filter(
      (id) => !previousEventIds.includes(id)
    );

    try {
      if (idsToRemove.length > 0) {
        await client.request<DeleteEventAvailabilityOfTutorMutation>(
          DeleteEventAvailabilityOfTutorDocument,
          {
            email: user?.mail,
            eventsAvailable: idsToRemove,
          }
        );
      }

      if (idsToAdd.length > 0) {
        await client.request<AddEventAvailabilityOfTutorMutation>(
          AddEventAvailabilityOfTutorDocument,
          {
            email: user?.mail,
            eventsAvailable: idsToAdd,
          }
        );
      }
    } catch (error) {
      if (!String(error).toLowerCase().includes("no valid smtp")) {
        toast.error(
          "Ein Fehler ist aufgetreten, lade die Seite neu oder versuche es später erneut"
        );
        return;
      }
    }

    setPreviousEventIds(selectedEventIds);
    toast.info("Deine Verfügbarkeiten wurden geupdated!");
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-3xl font-bold">Meine Verfügbarkeiten</h3>
          <p className="text-sm text-muted-foreground">
            Passe hier an für welche Tutorien du als Tutor:in verfügbar bist.
          </p>
        </div>
        <Separator />

        {!user?.confirmed ? (
          <div
            className={
              "w-full h-full flex flex-col justify-center items-center p-12"
            }
          >
            <BadgeX size={100} className={"stroke-red-600 mb-5"} />
            <p className={"text-xl font-bold"}>
              Diese Einstellung wird erst verfügbar, sobald du deine E-Mail
              bestätigt hast
            </p>
          </div>
        ) : (
          <div>
            <EventTable
              columns={eventColumns}
              data={events}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
            <div
              className={
                "flex justify-between items-center mt-5 w-full gap-x-12"
              }
            >
              <Button
                variant={"outline"}
                className={"flex-grow-[0.25]"}
                onClick={() =>
                  setRowSelection(
                    createRowSelectionFromEventIds(previousEventIds)
                  )
                }
              >
                Zurücksetzen
                <RotateCcw />
              </Button>

              <Button
                variant={"default"}
                className={"flex-grow-[0.75]"}
                onClick={() => onSubmit()}
                disabled={!hasSelectionChangedFromInit}
              >
                <Save />
                Speichern
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
