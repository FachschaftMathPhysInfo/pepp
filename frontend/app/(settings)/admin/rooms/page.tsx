"use client";

import { Separator } from "@/components/ui/separator";
import {AllBuildingsDocument, AllBuildingsQuery, Building} from "@/lib/gql/generated/graphql";
import {useEffect, useState} from "react";
import {getClient} from "@/lib/graphql";
import {defaultBuilding, defaultRoom} from "@/types/defaults";
import BuildingSection from "@/app/(settings)/admin/rooms/building-section";

export default function Settings() {
  const [buildings, setBuildings] = useState<Building[]>([]);

  const fetchBuildings = async() => {
    const client = getClient()
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

  }

  useEffect(() => {
    void fetchBuildings();
  })

  // FIXME: Dialogs for Editing Buildings and Rooms
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">Raum und Gebäudeverwaltung</h3>
        <p className="text-sm text-muted-foreground">
          Füge neue Orte hinzu und bearbeite vorhandene .
        </p>
      </div>
      <Separator />
      {buildings.map((building) => (
        <BuildingSection key={building.ID} building={building} refreshData={fetchBuildings}/>
      ))}
    </div>
  );
}
