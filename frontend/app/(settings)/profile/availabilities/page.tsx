"use client";

import {useCallback, useEffect, useState} from "react";
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
import {getClient} from "@/lib/graphql";
import {Button} from "@/components/ui/button";
import {EventTable} from "@/components/tables/events/event-table";
import {eventColumns} from "@/components/tables/events/event-columns";
import {RowSelectionState} from "@tanstack/react-table";
import {defaultEvent} from "@/types/defaults";
import {BadgeX, CalendarCheck2, RotateCcw, Save} from "lucide-react";
import {toast} from "sonner";
import {createRowSelectionFromEventIds, getEventIdsFromRowSelection} from "@/lib/tables";
import {ManagementPageHeader} from "@/components/management-page-header";
import {useUser} from "@/components/provider/user-provider";

export default function Settings() {
  const {user, sid} = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [previousEventIds, setPreviousEventIds] = useState<number[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [hasSelectionChangedFromInit, setHasSelectionChangedFromInit] = useState<boolean>(false);
  const fetchEvents = useCallback(async () => {
    if (!user) return
    const client = getClient(sid!);
    const futureEventsData = await client.request<TableEventsQuery>(TableEventsDocument, {
      needsTutors: true,
      onlyFuture: true,
    });
    const futureEvents: Event[] = futureEventsData.events.map((e) => ({
      ...defaultEvent,
      ...e,
    }));
    const availableEventsData = await client.request<AvailableEventIdsOfUserQuery>(AvailableEventIdsOfUserDocument, {
      mail: user.mail,
    });

    const availableEvents = availableEventsData.users.map((u) => u.availabilities);
    const initialIds = availableEvents.flatMap((usersEventList) => (usersEventList || []).map((event) => event.ID));

    setPreviousEventIds(initialIds);
    setEvents(futureEvents);
    setRowSelection(createRowSelectionFromEventIds(initialIds));
    setSelectedEventIds(initialIds);
  }, [sid, user]);

  useEffect(() => {
    if (sid) void fetchEvents();
  }, [fetchEvents, sid]);

  useEffect(() => {
    const newIds = getEventIdsFromRowSelection(rowSelection);
    setSelectedEventIds(newIds);
    setHasSelectionChangedFromInit(!(String(newIds) == String(previousEventIds)));
  }, [previousEventIds, rowSelection]);

  async function onSubmit() {
    if(!user || !sid) {
      toast.error("Ein Fehler ist aufgetreten. Bitte melde dich erneut an")
      return
    }

    const client = getClient(sid)
    const idsToRemove: number[] = previousEventIds.filter((id) => !selectedEventIds.includes(id));
    const idsToAdd: number[] = selectedEventIds.filter((id) => !previousEventIds.includes(id));

    try {
      if (idsToRemove.length > 0) {
        await client.request<DeleteEventAvailabilityOfTutorMutation>(DeleteEventAvailabilityOfTutorDocument, {
          id: user.ID,
          eventsAvailable: idsToRemove,
        });
      }

      if (idsToAdd.length > 0) {
        await client.request<AddEventAvailabilityOfTutorMutation>(AddEventAvailabilityOfTutorDocument, {
          id: user.ID,
          eventsAvailable: idsToAdd,
        });
      }
    } catch (error) {
      if (!String(error).toLowerCase().includes("no valid smtp")) {
        toast.error("Ein Fehler ist aufgetreten, lade die Seite neu oder versuche es später erneut");
        return;
      }
    }

    setPreviousEventIds(selectedEventIds);
    toast.success("Deine Verfügbarkeiten wurden aktualisiert");
  }

  return (
    <>
      <div className="space-y-6">
        <ManagementPageHeader
          iconNode={<CalendarCheck2/>}
          title={"Meine Verfügbarkeiten"}
          description={"Passe hier an für welche Tutorien du als Tutor:in verfügbar bist."}
        />
        {!user?.confirmed ? (
          <div className={"h-full flex flex-col flex-wrap justify-center items-center p-12"}>
            <BadgeX size={100} className={"stroke-red-600 mb-5"}/>
            <p className={"text-xl font-bold text-center"}>
              Diese Einstellung wird erst verfügbar, sobald du deine E-Mail bestätigt hast
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
            <div className={"flex justify-between items-center mt-5 w-full gap-x-12"}>
              <Button
                variant={"outline"}
                className={"flex-grow-[0.25]"}
                onClick={() => setRowSelection(createRowSelectionFromEventIds(previousEventIds))}
              >
                Zurücksetzen
                <RotateCcw/>
              </Button>

              <Button
                variant={"default"}
                className={"flex-grow-[0.75]"}
                onClick={() => onSubmit()}
                disabled={!hasSelectionChangedFromInit}
              >
                <Save/>
                Speichern
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
