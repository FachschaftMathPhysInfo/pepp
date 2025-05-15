import {Building} from "@/lib/gql/generated/graphql";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Pencil} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {RoomTable} from "@/components/tables/rooms-table/room-table";


interface BuildingSectionProps {
  building: Building;
  className?: string;
  refreshData: () => void;
}

export default function BuildingSection({building, className, refreshData} : BuildingSectionProps) {
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
          <div className={'text-muted-foreground/80 text-sm'}>{building.latitude} °N, {building.longitude} °W</div>
        </div>
        <div>
          <Button variant={"outline"} className={'border-0 hover:bg-background'}>
            <Pencil/>
          </Button>
        </div>
      </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Räume im Gebäude</AccordionTrigger>
            <AccordionContent>
              <RoomTable data={building.rooms ? building.rooms : []} refreshData={refreshData} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
    </div>
  )
}