"use client";

import { Separator } from "@/components/ui/separator";
import {
  AllBuildingsDocument,
  AllBuildingsQuery,
  Building,
  DeleteRoomDocument,
  DeleteRoomMutation,
  Room
} from "@/lib/gql/generated/graphql";
import React, {useCallback, useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {defaultBuilding, defaultRoom} from "@/types/defaults";
import BuildingSection from "@/app/(settings)/admin/rooms/building-section";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {toast} from "sonner";
import {GraphQLClient} from "graphql-request";
import {useUser} from "@/components/providers";
import {EditRoomDialog} from "@/app/(settings)/admin/rooms/edit-room-dialog";
import {School} from "lucide-react";


export type LocationDialogState = {
  mode: "deleteBuilding" | "deleteRoom" | "addBuilding" | "addRoom" | "editBuilding" | "editRoom" | null;
  building:  Building;
  room : Room;
}

export default function Settings() {
  const { sid } = useUser()
  const [client, setClient] = useState<GraphQLClient>(getClient());
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [dialogState, setDialogState] = useState<LocationDialogState>({mode: null, building: defaultBuilding, room: defaultRoom});

  // Data Fetching
  useEffect(() => {
    setClient(getClient(String(sid)))
  }, [sid]);

  const fetchBuildings = useCallback(async() => {
    const buildingData = await client.request<AllBuildingsQuery>(AllBuildingsDocument)

    if (buildingData.buildings) {
      setBuildings(buildingData.buildings.map((building) => ({
        ...defaultBuilding,
        ...building,
        rooms: building.rooms?.map((r) => ({
          ...defaultRoom,
          ...r
        }))
      })))
    }

  }, [client])

  useEffect(() => {
    void fetchBuildings();
  }, [fetchBuildings])

  // Dialog Handling
  const closeDialog = () => setDialogState({mode: null, building: defaultBuilding, room: defaultRoom});
  const handleDeleteBuilding = async () => {

  }
  const handleDeleteRoom = async () => {
    await client.request<DeleteRoomMutation>(DeleteRoomDocument, {
      building: dialogState.building.ID,
      number: dialogState.room.number
    })
  }

  // TODO: Dialogs for Editing & Creating Buildings
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold"> <School className={'inline mr-3'} />Raum und Gebäudeverwaltung</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Füge neue Orte hinzu und bearbeite vorhandene.
        </p>
      </div>
      <Separator />
      {buildings.length === 0 ? (
        <div className={'w-full p-10 border rounded-lg'}>Es sind noch keine Gebäude eingetragen</div>
      ) : (
        buildings.map((building) => (
          <BuildingSection key={building.ID} building={building} setDialogState={setDialogState}/>
        ))
      )}

      <ConfirmationDialog
        description={`Dies wird das Gebäude ${dialogState.building.name} unwiederruflich löschen`}
        onConfirm={ async () =>{
          await handleDeleteBuilding();
          toast.info(`${dialogState.building?.name} wurde erfolgreich gelöscht`)
        }}
        isOpen={dialogState.mode === "deleteBuilding"}
        closeDialog={closeDialog}
      />
      <ConfirmationDialog
        description={`Dies wird den Raum Nummer ${dialogState.room.number} unwiederruflich löschen`}
        onConfirm={ async () =>{
          await handleDeleteRoom()
          toast.info(`Raum Nummer ${dialogState.room.name} wurde erfolgreich gelöscht`)
        }}
        isOpen={dialogState.mode === "deleteRoom"}
        closeDialog={closeDialog}
      />
      <EditRoomDialog
        room={dialogState.room}
        isOpen={dialogState.mode === "editRoom"}
        closeDialog={closeDialog}
      />

    </div>
  );
}
