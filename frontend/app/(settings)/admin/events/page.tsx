"use client";

import React, {useCallback, useEffect, useState} from "react";
import {CirclePlus, FerrisWheel} from "lucide-react";
import {ManagementPageHeader} from "@/components/management-page-header";
import {useUser} from "@/components/providers";
import {
  DeleteEventDocument,
  DeleteEventMutation,
  Event,
  TableEventsWithoutTypeDocument,
  TableEventsWithoutTypeQuery,
  UmbrellasDocument,
  UmbrellasQuery
} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";
import {Button} from "@/components/ui/button";
import {defaultEvent} from "@/types/defaults";
import SearchInput from "@/components/search-input";
import UmbrellaEventSection from "@/app/(settings)/admin/events/umbrella-event-section";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {toast} from "sonner";
import EventDialog from "@/components/event-dialog/event-dialog";
import {Dialog} from "@/components/ui/dialog";
import {GraphQLClient} from "graphql-request";

export type EventsDialogState = {
  mode: "editEvent" | "addEvent" | "deleteEvent" | null;
  event: Event;
  umbrella?: Event;
};

export default function EventsOfUmbrella() {
  const {sid} = useUser();
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);

  const [client, setClient] = useState<GraphQLClient>(getClient());
  const [umbrellaEventsMap, setEventsByUmbrella] = useState<Record<number, Event[]>>({});

  const [dialogState, setDialogState] = useState<EventsDialogState>({
    mode: null,
    event: defaultEvent,
  });
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [closeupID, setCloseupID] = useState(0);
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    setClient(getClient(String(sid)));
  }, [sid]);

  const fetchUmbrellas = useCallback(async () => {
    const umbrellaData = await client.request<UmbrellasQuery>(
      UmbrellasDocument
    );
    const umbrellas = umbrellaData.umbrellas.map((umbrella) => ({
      ...defaultEvent,
      ...umbrella,
    }));
    setUmbrellas(umbrellas);
  }, [client]);


  const fetchEventsOfUmbrellas = useCallback(async () => {
    if (!umbrellas.length) return;
    const client = getClient(String(sid));

    const umbrellaEventsMap: Record<number, Event[]> = {};

    for (const umbrella of umbrellas) {
      const {events} = await client.request<TableEventsWithoutTypeQuery>(TableEventsWithoutTypeDocument, {
        umbrellaID: [umbrella.ID],
      });


      const allEvents = events
        .map((event) => ({
          ...defaultEvent,
          ...event,
        }));
      umbrellaEventsMap[umbrella.ID] = allEvents.length ? allEvents : [{...defaultEvent}];
    }


    setEventsByUmbrella(umbrellaEventsMap);
  }, [sid, umbrellas]);

  useEffect(() => {
    void fetchUmbrellas();
  }, [fetchUmbrellas]);

  useEffect(() => {
    if (umbrellas.length > 0) {
      void fetchEventsOfUmbrellas();
    }
  }, [umbrellas, fetchEventsOfUmbrellas]);

  // Dialog Handling
  const closeDialog = () =>
    setDialogState({mode: null, event: defaultEvent});

  const handleDeleteEvent = async () => {
    await client.request<DeleteEventMutation>(DeleteEventDocument, {
      eventIds: dialogState.event.ID,
    });
  };


  return (
    <div className="space-y-6">

      <ManagementPageHeader
        iconNode={<FerrisWheel/>}
        title="Event Verwaltung"
        description="Alle Veranstaltungen gruppiert nach Umbrella."

      />
      <SearchInput searchValue={searchValue} setSearchValue={setSearchValue}/>
      <div className="flex-1 space-y-6">
        {umbrellas.length === 0 ? (
          <div className="w-full p-10 border rounded-lg justify-center text-center">
            Es sind noch keine Programme eingetragen
          </div>
        ) : (
          umbrellas
          .filter((umbrella) =>
          (umbrellaEventsMap[umbrella.ID] || []).some((event) =>
          event.title.toLowerCase().includes(searchValue.toLowerCase())
          )
          )
            .map((umbrella) => (
              <UmbrellaEventSection
                key={umbrella.ID}
                umbrella={umbrella}
                events={umbrellaEventsMap[umbrella.ID] || []}
                setDialogState={setDialogState}
                setCloseupID={setCloseupID}
                setEventDialogOpen={setEventDialogOpen}
              />
            ))

        )}
        <ConfirmationDialog
          mode="confirmation"
          description={`Dies wird das Event ${dialogState.event.title} löschen.`}
          onConfirm={async () => {
            await handleDeleteEvent();
            closeDialog();
            void fetchEventsOfUmbrellas();
            toast.info(
              `${dialogState.event.title} wurde erfolgreich gelöscht`
            );
          }}
          isOpen={dialogState.mode === "deleteEvent"}
          closeDialog={closeDialog}
        />
        <Dialog open={dialogState.mode === "editEvent" || dialogState.mode === "addEvent"} onOpenChange={(open) => {
          if (!open) {
            setDialogState({mode: null, event: defaultEvent});
          }
        }}>
          <EventDialog
            id={dialogState.event.ID}
            open={dialogState.mode === "editEvent" || dialogState.mode === "addEvent"}
            modify={dialogState.mode === "editEvent"}
            umbrella={dialogState.umbrella}
          />
        </Dialog>


      </div>
    </div>


  )
}
