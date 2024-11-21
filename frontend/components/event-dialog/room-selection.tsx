"use client";

import { Button } from "@/components/ui/button";
import {
  EventTutorRoomPair,
  MutationUpdateRoomForTutorialArgs,
  Room,
} from "@/lib/gql/generated/graphql";
import { ArrowDownToDot, Check, ChevronsUpDown, Move } from "lucide-react";
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
import { useUmbrella } from "../providers";

interface RoomSelectionProps {
  i?: number;
  tutorial: EventTutorRoomPair | null;
  groupedRooms: { [key: string]: Room[] };
  setAvailableRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setCapacities?: React.Dispatch<React.SetStateAction<number[]>>;
  updateRooms: MutationUpdateRoomForTutorialArgs[];
  setUpdateRooms: React.Dispatch<
    React.SetStateAction<MutationUpdateRoomForTutorialArgs[]>
  >;
}

export function RoomSelection({
  i,
  tutorial,
  groupedRooms,
  setAvailableRooms,
  setUpdateRooms,
  updateRooms,
  setCapacities,
}: RoomSelectionProps) {
  const { closeupID } = useUmbrella();

  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(tutorial?.room);

  const rooms = structuredClone(groupedRooms);
  if (selectedRoom) {
    const buildingID = selectedRoom.building.ID;
    if (!rooms[buildingID]) {
      rooms[buildingID] = [];
    }
    rooms[buildingID].push(selectedRoom);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
            <CommandEmpty>Keine Räume verfügbar.</CommandEmpty>
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
                        const u = updateRooms.find(
                          (r) =>
                            r.oldBuildingID === tutorial?.room.building.ID &&
                            r.oldRoomNumber === tutorial.room.number
                        );
                        if (room !== selectedRoom) {
                          if (setCapacities && i != undefined) {
                            setCapacities((prev) => {
                              prev[i] = room.capacity ?? 1;
                              return prev;
                            });
                          }
                          setAvailableRooms((prev) => {
                            const newRooms = prev.filter(
                              (r) =>
                                !(
                                  r.number === room.number &&
                                  r.building.ID === room.building.ID
                                )
                            );
                            if (selectedRoom) {
                              newRooms.push(selectedRoom);
                            }
                            return newRooms;
                          });
                          setSelectedRoom(room);
                          if (
                            room.number !== tutorial?.room.number &&
                            room.building.ID !== tutorial?.room.building.ID
                          ) {
                            if (u) {
                              u.newRoomNumber = room.number;
                              u.newBuildingID = room.building.ID;
                            } else {
                              setUpdateRooms((prev) => [
                                ...prev,
                                {
                                  eventID: closeupID ?? 0,
                                  oldBuildingID:
                                    tutorial?.room.building.ID ?? 0,
                                  oldRoomNumber: tutorial?.room.number ?? "",
                                  newBuildingID: room.building.ID,
                                  newRoomNumber: room.number,
                                },
                              ]);
                            }
                          } else {
                            setUpdateRooms((prev) =>
                              prev.filter((r) => r !== u)
                            );
                          }
                        } else {
                          if (setCapacities && i !== undefined) {
                            setCapacities((prev) => {
                              prev[i] = 0;
                              return prev;
                            });
                          }
                          if (selectedRoom) {
                            setAvailableRooms((prev) => [
                              ...prev,
                              selectedRoom,
                            ]);
                          }
                          setSelectedRoom(undefined);
                        }
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
                            <Move className="h-4 w-4 opacity-80 mr-1" />
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
