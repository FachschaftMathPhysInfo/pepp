import {Building} from "@/lib/gql/generated/graphql";
import {cn} from "@/lib/utils";
import {CirclePlus, Map as MapIcon, Pencil, Trash} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {RoomTable} from "@/components/tables/rooms-table/room-table";
import {LocationDialogState} from "@/app/(settings)/admin/rooms/page";
import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";

interface BuildingSectionProps {
  building: Building;
  className?: string;
  setDialogState: React.Dispatch<React.SetStateAction<LocationDialogState>>;
}

export default function BuildingSection({building, className, setDialogState}: BuildingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className={'flex justify-between items-center'}>
            {building.name}
            <div>
              <button
                className={'mr-4'}
                onClick={() => setDialogState({
                  mode: "createRoom",
                  roomNumber: '',
                  building: building
                })}
              >
                <CirclePlus className={'w-5'}/>
              </button>
              <button
                className={'mr-4'}
                onClick={() => setDialogState({mode: "editBuilding", building: building, roomNumber: ""})}
              >
                <Pencil className={'w-5'}/>
              </button>
              <button
                className={'mr-4'}
                onClick={() => setDialogState({mode: "deleteBuilding", building: building, roomNumber: ""})}
              >
                <Trash className={'w-5 stroke-red-500'}/>
              </button>
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          <span>{building.street} {building.number}</span>
          <span className={'mx-2'}>|</span>
          <span>{building.zip} {building.city}</span>
          <Link
            className={'text-muted-foreground/80 text-sm hover:underline block mt-0.5'}
            href={`https://www.openstreetmap.org/#map=19/${building.latitude}/${building.longitude}`}
          >
            <MapIcon className={'inline w-3 h-3 mr-1'}/>
            {building.latitude} °N, {building.longitude} °W
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className={'hover:no-underline'}>
              Räume im Gebäude
            </AccordionTrigger>
            <AccordionContent>
              {building.rooms
                ? (<RoomTable data={building.rooms} setDialogState={setDialogState} currentBuilding={building}/>)
                : (
                  <div className={'w-full text-center border rounded-lg p-10'}>
                    Dieses Gebäude hat noch keine Räume eingetragen.
                    <span
                      onClick={() => setDialogState({mode: "createRoom", roomNumber: "", building: building})}
                      className={'ml-1 text-blue-500 underlined cursor-pointer'}
                    >
                    Hier kannst du einen erstellen.
                  </span>
                  </div>
                )
              }
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}