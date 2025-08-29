"use client";

import {
  AllBuildingsDocument,
  AllBuildingsQuery,
  AllTutorialsBuildingsIdDocument,
  AllTutorialsBuildingsIdQuery,
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
import {ManagementPageHeader} from "@/components/management-page-header";

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
  const [amountTutorialsOfBuilding, setAmountTutorialsOfBuilding] = useState<number>(0)

  // Fetch Amount of Tutorials Per Building
  useEffect(() => {
    const fetchAmountTutorialsOfBuilding = async (id: number) => {
      const data = await client.request<AllTutorialsBuildingsIdQuery>(AllTutorialsBuildingsIdDocument)
      const tutorialsOfBuilding = data.tutorials
        .filter(tutorial => tutorial.room.building.ID === id)

      setAmountTutorialsOfBuilding(!tutorialsOfBuilding ? 0 : tutorialsOfBuilding.length)
    }

    void fetchAmountTutorialsOfBuilding(dialogState.building.ID)
  }, [dialogState.building]);

  // Fetch Client
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

  const closeDialog = () => setDialogState({mode: null, building: defaultBuilding, roomNumber: ""});

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
      <ManagementPageHeader
        iconNode={<School/>}
        title={"Raum und Gebäudeverwaltung"}
        description={"Füge neue Orte hinzu und bearbeite vorhandene."}
        actionButton={
          <Button
            variant={"secondary"}
            onClick={() =>
              setDialogState({
                mode: "createBuilding",
                building: defaultBuilding,
                roomNumber: "",
              })
            }
          >
            <CirclePlus/>
            Gebäude hinzufügen
          </Button>
        }
      />

      {buildings.length === 0 ? (
        <div
          className={"w-full p-10 border rounded-lg justify-center text-center"}
        >
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
        description={`Dies wird das Gebäude ${dialogState.building.name} ` +
          ((amountTutorialsOfBuilding > 1) ? `und alle ${amountTutorialsOfBuilding} Tutorien die diesem Gebäude zugeordnet sind`
          : (amountTutorialsOfBuilding === 1) ? 'und das dem Gebäude zugeordnetem Tutorium' : '')
          + ' unwiederruflich löschen'
        }
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
        isOpen={
          dialogState.mode === "editBuilding" ||
          dialogState.mode === "createBuilding"
        }
        closeDialog={closeDialog}
        refreshTable={fetchBuildings}
        createMode={dialogState.mode === "createBuilding"}
      />
    </div>
  );
}
