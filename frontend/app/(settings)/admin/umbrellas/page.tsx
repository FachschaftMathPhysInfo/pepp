"use client";

import {
  DeleteEventDocument,
  DeleteEventMutation,
  Event,
  UmbrellasDocument,
  UmbrellasQuery,
} from "@/lib/gql/generated/graphql";
import React, { useCallback, useEffect, useState } from "react";
import { getClient } from "@/lib/graphql";
import { defaultEvent } from "@/types/defaults";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "sonner";
import { GraphQLClient } from "graphql-request";
import { useUser } from "@/components/providers";
import { CirclePlus, Umbrella } from "lucide-react";
import UmbrellaSection from "@/app/(settings)/admin/umbrellas/umbrella-section";
import { UmbrellaDialog } from "@/app/(settings)/admin/umbrellas/umbrella-dialog";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/search-input";
import { ManagementPageHeader } from "@/components/management-page-header";

export type UmbrellaDialogState = {
  mode: "editUmbrella" | "addUmbrella" | "deleteUmbrella" | null;
  umbrella: Event;
};

export default function UmbrellaSettings() {
  const { sid } = useUser();
  const [client, setClient] = useState<GraphQLClient>(getClient());
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);
  const [dialogState, setDialogState] = useState<UmbrellaDialogState>({
    mode: null,
    umbrella: defaultEvent,
  });
  const [searchValue, setSearchValue] = useState<string>("");

  // Data Fetching
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

  useEffect(() => {
    void fetchUmbrellas();
  }, [fetchUmbrellas]);

  // Dialog Handling
  const closeDialog = () =>
    setDialogState({ mode: null, umbrella: defaultEvent });

  const handleDeleteUmbrella = async () => {
    await client.request<DeleteEventMutation>(DeleteEventDocument, {
      eventIds: dialogState.umbrella.ID,
    });
  };

  return (
    <div className="space-y-6">
      <div className={"flex items-center flex-wrap gap-y-3 mb-4"}>
        <ManagementPageHeader
          iconNode={<Umbrella />}
          title={"Programm Verwaltung"}
          description={"Verwalte hier Deine Programme."}
          actionButton={
            <Button
              variant={"outline"}
              onClick={() =>
                setDialogState({
                  mode: "addUmbrella",
                  umbrella: defaultEvent,
                })
              }
            >
              <CirclePlus />
              Programm hinzufügen
            </Button>
          }
        />
      </div>

      <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} />

      {umbrellas.length === 0 ? (
        <div
          className={"w-full p-10 border rounded-lg justify-center text-center"}
        >
          Es sind noch keine Programme eingetragen
        </div>
      ) : (
        umbrellas
          .filter((umbrella) => umbrella.title.includes(searchValue))
          .map((umbrella) => (
            <UmbrellaSection
              key={umbrella.ID}
              umbrella={umbrella}
              setDialogState={setDialogState}
            />
          ))
      )}

      <ConfirmationDialog
        mode={"confirmation"}
        description={`Dies wird das Programm ${dialogState.umbrella.title} und alle zugehörigen Veranstaltungen unwiederruflich löschen`}
        onConfirm={async () => {
          await handleDeleteUmbrella();
          closeDialog();
          void fetchUmbrellas();
          toast.info(
            `${dialogState.umbrella.title} wurde erfolgreich gelöscht`
          );
        }}
        isOpen={dialogState.mode === "deleteUmbrella"}
        closeDialog={closeDialog}
      />
      <UmbrellaDialog
        umbrella={{ ...defaultEvent, ...dialogState.umbrella }}
        umbrellas={umbrellas}
        isOpen={
          dialogState.mode === "editUmbrella" ||
          dialogState.mode === "addUmbrella"
        }
        closeDialog={closeDialog}
        refreshTable={fetchUmbrellas}
        createMode={dialogState.mode === "addUmbrella"}
      />
    </div>
  );
}
