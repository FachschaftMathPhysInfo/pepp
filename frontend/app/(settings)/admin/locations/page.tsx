"use client";

import {Separator} from "@/components/ui/separator";
import {
  AllBuildingsDocument,
  AllBuildingsQuery,
  Building,
  DeleteBuildingDocument,
  DeleteBuildingMutation,
  DeleteRoomDocument,
  DeleteRoomMutation,
} from "@/lib/gql/generated/graphql";
import React, {useCallback, useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {defaultBuilding, defaultRoom} from "@/types/defaults";
import BuildingSection from "@/app/(settings)/admin/locations/building-section";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {toast} from "sonner";
import {GraphQLClient} from "graphql-request";
import {useUser} from "@/components/providers";
import {RoomDialog} from "@/app/(settings)/admin/locations/room-dialog";
import {CirclePlus, School} from "lucide-react";
import {Button} from "@/components/ui/button";
import {BuildingDialog} from "@/app/(settings)/admin/locations/building-dialog";

export type LocationDialogState = {
  mode:
    | "deleteBuilding"
    | "deleteRoom"
    | "addBuilding"
    | "addRoom"
    | "editBuilding"
    | "editRoom"
    | "createRoom"
    | "createBuilding"
    | null;
  building: Building;
  roomNumber: string;
};

export default function LocationSettings() {
  const {sid} = useUser();
  const [client, setClient] = useState<GraphQLClient>(getClient());
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [dialogState, setDialogState] = useState<LocationDialogState>({
    mode: null,
    building: defaultBuilding,
    roomNumber: "",
  });

  // Data Fetching
  useEffect(() => {
    setClient(getClient(String(sid)));
  }, [sid]);

  const fetchBuildings = useCallback(async () => {
    const buildingData = await client.request<AllBuildingsQuery>(
      AllBuildingsDocument
    );
    if (buildingData.buildings) {
      setBuildings(
        buildingData.buildings.map((building) => ({
          ...defaultBuilding,
          ...building,
          rooms: building.rooms?.map((room) => ({
            ...defaultRoom,
            ...room,
          })),
        }))
      );
    }
  }, [client]);

  useEffect(() => {
    void fetchBuildings();
  }, [fetchBuildings]);

  // Dialog Handling
  const closeDialog = () =>
    setDialogState({mode: null, building: defaultBuilding, roomNumber: ""});

  const handleDeleteBuilding = async () => {
    await client.request<DeleteBuildingMutation>(DeleteBuildingDocument, {
      ID: dialogState.building.ID,
    });
  };

  const handleDeleteRoom = async () => {
    await client.request<DeleteRoomMutation>(DeleteRoomDocument, {
      roomNumber:
        dialogState.building.rooms?.find(
          (room) => room.number === dialogState.roomNumber
        )?.number ?? defaultRoom.number,
      buildingID: dialogState.building.ID,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className={'flex items-center'}>
          <School className={"inline mx-3"}/>
          <h3 className="text-3xl font-bold">
            Raum und Gebäudeverwaltung
          </h3>
          <Button variant={"secondary"} className={'ml-4'} onClick={() => setDialogState({
            mode: "createBuilding",
            building: defaultBuilding,
            roomNumber: "",
          })}>
            <CirclePlus />
            Gebäude hinzufügen
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Füge neue Orte hinzu und bearbeite vorhandene.
        </p>
      </div>
      <Separator/>
      {buildings.length === 0 ? (
        <div className={"w-full p-10 border rounded-lg"}>
          Es sind noch keine Gebäude eingetragen
        </div>
      ) : (
        buildings.map((building) => (
          <BuildingSection
            key={building.ID}
            building={building}
            setDialogState={setDialogState}
          />
        ))
      )}

      <ConfirmationDialog
        mode={"confirmation"}
        description={`Dies wird das Gebäude ${dialogState.building.name} und alle Tutorien die diesem Gebäude zugeordnet sind unwiederruflich löschen`}
        onConfirm={async () => {
          await handleDeleteBuilding();
          closeDialog();
          void fetchBuildings();
          toast.info(`${dialogState.building.name} wurde erfolgreich gelöscht`);
        }}
        isOpen={dialogState.mode === "deleteBuilding"}
        closeDialog={closeDialog}
      />
      <ConfirmationDialog
        mode={"confirmation"}
        description={`Dies wird den Raum Nummer ${dialogState.roomNumber} unwiederruflich löschen`}
        onConfirm={async () => {
          await handleDeleteRoom();
          closeDialog();
          // implicitly rerenders the room table... maybe not that beautiful
          void fetchBuildings();
          toast.info(
            `Raum Nummer ${dialogState.roomNumber} wurde erfolgreich gelöscht`
          );
        }}
        isOpen={dialogState.mode === "deleteRoom"}
        closeDialog={closeDialog}
      />
      <RoomDialog
        room={
          dialogState.building.rooms?.find(
            (room) => room.number === dialogState.roomNumber
          ) ?? defaultRoom
        }
        currentBuilding={dialogState.building}
        buildings={buildings}
        isOpen={
          dialogState.mode === "editRoom" || dialogState.mode === "createRoom"
        }
        closeDialog={closeDialog}
        refreshTable={fetchBuildings}
        createMode={dialogState.mode === "createRoom"}
      />

      <BuildingDialog
        currentBuilding={dialogState.building}
        isOpen={dialogState.mode === "editBuilding" || dialogState.mode === "createBuilding"}
        closeDialog={closeDialog}
        refreshTable={fetchBuildings}
        createMode={dialogState.mode === "createBuilding"}
      />
    </div>
  );
}
