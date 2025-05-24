"use client";

import {Separator} from "@/components/ui/separator";
import {
  DeleteEventDocument,
  DeleteEventMutation,
  Event,
  UmbrellasDocument,
  UmbrellasQuery
} from "@/lib/gql/generated/graphql";
import React, {useCallback, useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {defaultEvent} from "@/types/defaults";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {toast} from "sonner";
import {GraphQLClient} from "graphql-request";
import {useUser} from "@/components/providers";
import {Umbrella} from "lucide-react";
import UmbrellaSection from "@/app/(settings)/admin/umbrellas/umbrella-section";
import {EditUmbrellaDialog} from "@/app/(settings)/admin/umbrellas/edit-umbrella-dialog";

export type UmbrellaDialogState = {
  mode: "editUmbrella" | "addUmbrella" | "deleteUmbrella" | null
  umbrella: Event
};

export default function UmbrellaSettings() {
  const { sid } = useUser();
  const [client, setClient] = useState<GraphQLClient>(getClient());
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);
  const [dialogState, setDialogState] = useState<UmbrellaDialogState>({
    mode: null,
    umbrella: defaultEvent,
  });

  // Data Fetching
  useEffect(() => {
    setClient(getClient(String(sid)));
  }, [sid]);

  const fetchUmbrellas = useCallback(async () => {
    const umbrellaData = await client.request<UmbrellasQuery>(UmbrellasDocument)
    const umbrellas = umbrellaData.umbrellas.map(umbrella => ({
      ...defaultEvent,
      ...umbrella
    }))
    setUmbrellas(umbrellas);
  }, [client]);

  useEffect(() => {
    void fetchUmbrellas();
  }, [fetchUmbrellas]);

  // Dialog Handling
  const closeDialog = () => setDialogState({ mode: null, umbrella: defaultEvent});

  const handleDeleteUmbrella = async () => {
    await client.request<DeleteEventMutation>(DeleteEventDocument, {eventIds: dialogState.umbrella.ID})
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold flex items-center">
          <Umbrella className={"inline mr-3"} />
          Programmverwaltung
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Verwalte hier Deine Programme.
        </p>
      </div>
      <Separator />
      {umbrellas.length === 0 ? (
        <div className={"w-full p-10 border rounded-lg"}>
          Es sind noch keine Programme eingetragen
        </div>
      ) : (
        umbrellas.map((umbrella) => (
          <UmbrellaSection key={umbrella.ID} umbrella={umbrella} setDialogState={setDialogState}/>
        ))
      )}

      <ConfirmationDialog
        mode={"confirmation"}
        description={`Dies wird das Programm ${dialogState.umbrella.title} und alle zugehörigen Veranstaltungen unwiederruflich löschen`}
        onConfirm={async () => {
          await handleDeleteUmbrella();
          closeDialog();
          void fetchUmbrellas();
          toast.info(`${dialogState.umbrella.title} wurde erfolgreich gelöscht`);
        }}
        isOpen={dialogState.mode === "deleteUmbrella"}
        closeDialog={closeDialog}
      />
      <EditUmbrellaDialog
        umbrella={{...defaultEvent, ...dialogState.umbrella}}
        umbrellas={umbrellas}
        isOpen={dialogState.mode === "editUmbrella" || dialogState.mode === "addUmbrella"}
        closeDialog={closeDialog}
        refreshTable={fetchUmbrellas}
        createMode={dialogState.mode === "addUmbrella"}
      />
    </div>
  );
}
