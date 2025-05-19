import { Button } from "@/components/ui/button";
import { Room } from "@/lib/gql/generated/graphql";
import { ArrowDownToDot, Check, ChevronsUpDown, Users } from "lucide-react";
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";

interface RoomSelectionProps {
  selectedRoom: Room | undefined;
  onSelectedRoomChange: (room: Room | undefined) => void;
  groupedRooms: { [key: string]: Room[] };
}

export function RoomSelection({
  selectedRoom,
  onSelectedRoomChange,
  groupedRooms,
}: RoomSelectionProps) {
  const [open, setOpen] = useState(false);

  const rooms = structuredClone(groupedRooms);
  if (selectedRoom) {
    const buildingID = selectedRoom.building.ID;
    if (!rooms[buildingID]) {
      rooms[buildingID] = [];
    }
    rooms[buildingID].push(selectedRoom);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit h-fit space-x-2"
        >
          {selectedRoom ? (
            <div className="flex flex-col items-start">
              <p className="text-xs text-muted-foreground">
                {selectedRoom?.building.name}
              </p>
              <p>
                {selectedRoom?.name ? selectedRoom.name : selectedRoom?.number}
              </p>
            </div>
          ) : (
            <p>Raum wählen...</p>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Raum oder Gebäude..." />
          <CommandList>
            <CommandEmpty>Keinen Raum gefunden.</CommandEmpty>
            {Object.keys(rooms).map((bID) => {
              const building = rooms[bID][0].building;
              return (
                <CommandGroup key={bID} heading={building.name}>
                  {rooms[bID].map((room) => (
                    <CommandItem
                      key={room.number + room.building.ID}
                      value={
                        room.number +
                        room.name +
                        room.building.name +
                        room.building.city +
                        room.building.street +
                        room.building.zip +
                        room.building.number
                      }
                      onSelect={() => {
                        onSelectedRoomChange(room);
                        setOpen(false);
                      }}
                    >
                      {room.name ? room.name : room.number}
                      <div className="text-xs text-muted-foreground flex flex-row space-x-2 ml-2">
                        {room.name && (
                          <div className="flex flex-row">
                            <ArrowDownToDot className="h-4 w-4" />
                            {room.number}
                          </div>
                        )}
                        {room.capacity && (
                          <div className="flex flex-row">
                            <Users className="h-4 w-4 mr-1" />
                            {room.capacity}
                          </div>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          room === selectedRoom ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
