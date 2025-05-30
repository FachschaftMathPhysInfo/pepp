import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Building, Room} from "@/lib/gql/generated/graphql";
import {ColumnDef} from "@tanstack/react-table";
import {MoreHorizontal} from "lucide-react";
import React, {SetStateAction} from "react";
import {LocationDialogState} from "@/app/(settings)/admin/rooms/page";


interface RoomColumnProps {
  setDialogState: React.Dispatch<SetStateAction<LocationDialogState>>;
  currentBuilding: Building;
}

export function RoomColumn({currentBuilding, setDialogState}: RoomColumnProps): ColumnDef<Room>[] {

  //FIXME: "Nummern sollten rechts-aligned sein" - Jan
  return [
    {
      accessorKey: "floor",
      header: "Stockwerk",
      cell: ({row}) => row.original.floor
    },
    {
      accessorKey: "number",
      header: "Nummer",
      cell: ({row}) => row.original.number
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({row}) => row.original.name,
    },
    {
      accessorKey: "capacity",
      header: "Kapazität",
      cell: ({row}) => row.original.capacity
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => {
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menü öffnen</span>
                  <MoreHorizontal className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setDialogState({
                    mode: "editRoom",
                    roomNumber: row.original.number,
                    building: currentBuilding,
                  })}
                >
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDialogState({
                      mode: "deleteRoom",
                      roomNumber: row.original.number,
                      building: currentBuilding
                    })
                  }}
                >
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
}