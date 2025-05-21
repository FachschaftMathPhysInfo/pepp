"use client";

import {useCallback, useEffect, useState} from "react";
import {
  AddEventAvailabilityOfTutorDocument,
  AddEventAvailabilityOfTutorMutation,
  AvailableEventIdsOfUserDocument,
  AvailableEventIdsOfUserQuery, DeleteEventAvailabilityOfTutorDocument, DeleteEventAvailabilityOfTutorMutation,
  Event,
  TableEventsDocument,
  TableEventsQuery,
} from "@/lib/gql/generated/graphql"
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {Separator} from "@/components/ui/separator"
import {Button} from "@/components/ui/button"
import {EventTable} from "@/components/tables/event-table/event-table";
import {eventColumns} from "@/components/tables/event-table/event-columns";
import {RowSelection, RowSelectionState} from "@tanstack/react-table";
import {defaultEvent} from "@/types/defaults";
import {Save} from "lucide-react";
import {GraphQLClient} from "graphql-request";
import {toast} from "sonner";
import {getIdsFromRowSelection} from "@/lib/utils/tableUtils";

export default function Settings() {
  const { user, sid } = useUser()
  const [client, setClient] = useState<GraphQLClient>(getClient())
  const [events, setEvents] = useState<Event[]>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [previousEventIds, setPreviousEventIds] = useState<number[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([])

  const fetchEvents = useCallback(async () => {
    const futureEventsData = await client.request<TableEventsQuery>(TableEventsDocument, {
      needsTutors: true,
      onlyFuture: true,
    })
    const futureEvents: Event[] = futureEventsData.events.map(e => ({
      ...defaultEvent,
      ...e
    }))

    const availableEventsData = await client.request<AvailableEventIdsOfUserQuery>(
      AvailableEventIdsOfUserDocument,
      {mail: user?.mail}
    )

    const availableEvents = availableEventsData.users.map(u => u.availabilities)

    // This is some nested Array fuckery
    setPreviousEventIds(availableEvents.flatMap(usersEventList =>
      (usersEventList || []).map(event => event.ID)))

    setEvents(futureEvents);
    setRowSelection(Object.fromEntries(previousEventIds.map(id => [id, true])))
    setSelectedEventIds(getIdsFromRowSelection(rowSelection))
  }, [client, user?.mail])

  useEffect(() => {
    if( sid ) setClient(getClient(sid))
  }, [sid]);

  useEffect(() => {
    if(sid) void fetchEvents()
  }, [fetchEvents, sid]);

  useEffect(() => {
    setSelectedEventIds(getIdsFromRowSelection(rowSelection))
  }, [rowSelection])


  async function onSubmit() {
    console.log('in Submit: ', selectedEventIds)
    const idsToRemove: number[] = previousEventIds.filter(id => !selectedEventIds.includes(id))
    const idsToAdd: number[] = selectedEventIds.filter(id => !previousEventIds.includes(id))

    if(idsToRemove.length > 0) {
      await client.request<DeleteEventAvailabilityOfTutorMutation>(DeleteEventAvailabilityOfTutorDocument, {
        mail:  user?.mail,
        eventId: idsToRemove,
      })
    }

    if(idsToRemove.length > 0) {
      await client.request<AddEventAvailabilityOfTutorMutation>(AddEventAvailabilityOfTutorDocument, {
        mail: user?.mail,
        eventId: idsToAdd,
      })
    }

    toast.info("Deine Verfügbarkeiten wurden geupdated!")
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
        <div>
          <EventTable
            columns={eventColumns}
            data={events}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
          <Button
            variant={"default"}
            className={'mt-5 w-full'}
            onClick={() => onSubmit()}
            /*Mate idk either, but it works*/
            disabled={String(selectedEventIds) === String(previousEventIds)}
          >
            <Save/>
            Speichern
          </Button>
        </div>
      </div>
    </>
  );
}
