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
  UmbrellasDocument
} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";
import {Button} from "@/components/ui/button";
import {defaultEvent} from "@/types/defaults";
import SearchInput from "@/components/search-input";
import UmbrellaEventSection from "@/app/(settings)/admin/events/umbella-event-section";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {toast} from "sonner";
import EventDialog from "@/components/event-dialog/event-dialog";
import {Dialog} from "@/components/ui/dialog";
import {GraphQLClient} from "graphql-request";

export type EventsDialogState = {
  mode: "editEvent" | "addEvent" | "deleteEvent" | null;
  umbrella: Event;
};

export default function EventsOfUmbrella() {
  const {sid} = useUser();
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);

  const [client, setClient] = useState<GraphQLClient>(getClient());
  const [umbrellaEventsMap, setEventsByUmbrella] = useState<Record<number, Event[]>>({});

  const [dialogState, setDialogState] = useState<EventsDialogState>({
    mode: null,
    umbrella: defaultEvent,
  });
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [closeupID, setCloseupID] = useState(0);
  const [searchValue, setSearchValue] = useState<string>("");


  const fetchUmbrellas = useCallback(async () => {
    const client = getClient(String(sid));
    const {umbrellas} = await client.request(UmbrellasDocument, {
      onlyFuture: true,
    });
    setUmbrellas(umbrellas as Event[]);
  }, [sid]);

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
    void fetchEventsOfUmbrellas();
  }, [fetchEventsOfUmbrellas]);

  const handleDeleteEvent = async () => {
    await client.request<DeleteEventMutation>(DeleteEventDocument, {
      eventIds: dialogState.umbrella.tutorials?.map((tutorial) => tutorial.ID),
    });
  };

  const closeDialog = () =>
    setDialogState({mode: null, umbrella: defaultEvent});


  return (
    <div className="space-y-6">
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
      <EventDialog id={closeupID} open={eventDialogOpen} />
    </Dialog>
      <ManagementPageHeader
        iconNode={<FerrisWheel/>}
        title="Event Verwaltung"
        description="Alle Veranstaltungen gruppiert nach Umbrella."
        actionButton={
          <Button
            variant={"outline"}
            onClick={() => {
              setDialogState({
                mode: "addEvent",
                umbrella: defaultEvent,
              });
            }}

          >
            <CirclePlus />
            Event hinzufügen
          </Button>
        }

      />
      <SearchInput searchValue={searchValue} setSearchValue={setSearchValue}/>
      <div className="flex-1 space-y-6">
        {umbrellas.length === 0 ? (
          <div className="w-full p-10 border rounded-lg justify-center text-center">
            Es sind noch keine Programme eingetragen
          </div>
        ) : (
          umbrellas
            .filter((umbrella) => umbrella.title.includes(searchValue))
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
          description={`Dies wird das Event löschen.`}
          onConfirm={async () => {
            await handleDeleteEvent();
            closeDialog();
            void fetchEventsOfUmbrellas();
            toast.info(
              `${dialogState.umbrella.title} wurde erfolgreich gelöscht`
            );
          }}
          isOpen={dialogState.mode === "deleteEvent"}
          closeDialog={closeDialog}
        />

      </div>
    </div>


  )
}
