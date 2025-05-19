import {Building} from "@/lib/gql/generated/graphql";
import {cn} from "@/lib/utils";
import {CirclePlus, Map as MapIcon, Pencil} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {RoomTable} from "@/components/tables/rooms-table/room-table";
import {LocationDialogState} from "@/app/(settings)/admin/rooms/page";
import React from "react";

interface BuildingSectionProps {
  building: Building;
  className?: string;
  setDialogState: React.Dispatch<React.SetStateAction<LocationDialogState>>;
}

export default function BuildingSection({building, className, setDialogState}: BuildingSectionProps) {
  return (
    <div className={cn('border border-muted-foreground/50 rounded-2xl p-8', className)}>
      <div className={'w-full flex flex-row justify-between items-start'}>
        <div>
          <div className={'font-bold text-xl'}>{building.name}</div>
          <div className={'text-muted-foreground'}>
            <span>{building.street} {building.number}</span>
            <span className={'mx-2'}>|</span>
            <span>{building.zip} {building.city}</span>
          </div>
          <a className={'text-muted-foreground/80 text-sm hover:underline'}
             href={`https://www.openstreetmap.org/#map=19/${building.latitude}/${building.longitude}`}>
            <MapIcon className={'inline w-3 h-3 mr-1'}/>
            {building.latitude} °N, {building.longitude} °W
          </a>
        </div>
        <div>
          <button
            className={'mr-4'}
            onClick={() => setDialogState({
              mode: "createRoom",
              roomNumber: '',
              building: building
            })}
          >
            <CirclePlus className={'w-5'} />
          </button>
          <button
            className={'mr-4'}
            onClick={() => setDialogState({mode: "editBuilding", building: building, roomNumber: ""})}
          >
            <Pencil className={'w-5'}/>
          </button>
        </div>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className={'hover:no-underline'}>
              Räume im Gebäude
          </AccordionTrigger>
          <AccordionContent>
            {building.rooms
              ? (<RoomTable data={building.rooms} setDialogState={setDialogState} currentBuilding={building}/>)
              : (
                // TODO: add button to create new room
                <div className={'w-full text-center border rounded-lg p-10'}>Dieses Gebäude hat noch keine Räume
                  eingetragen</div>
              )
            }
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}