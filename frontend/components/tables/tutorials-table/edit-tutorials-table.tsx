"use client";

import { defaultRoom, defaultTutorial, defaultUser } from "@/types/defaults";
import { Button } from "@/components/ui/button";
import {
  Room,
  Tutorial,
  TutorialAvailabilitysDocument,
  TutorialAvailabilitysQuery,
  TutorialAvailabilitysQueryVariables,
  User,
} from "@/lib/gql/generated/graphql";
import {
  Info,
  MessageCircleQuestionMark,
  Plus,
  Save,
  SquareMinus,
} from "lucide-react";
import { useUser } from "../../providers";
import { getClient } from "@/lib/graphql";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "../../ui/table";
import { TutorSelection } from "./tutor-selection";
import { RoomSelection } from "./room-selection";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NumericInput from "@/components/numeric-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "react-markdown";

interface EditTutorialsTableProps {
  id: number;
  tutorials: Tutorial[];
  setTutorialsAction: React.Dispatch<React.SetStateAction<Tutorial[]>>;
}

export function EditTutorialsTable({
  id,
  tutorials,
  setTutorialsAction,
}: EditTutorialsTableProps) {
  const { sid } = useUser();
  const [availableTutors, setAvailableTutors] = useState<User[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [newTutorialTutors, setNewTutorialTutors] = useState<User[]>([]);
  const [newTutorialRoom, setNewTutorialRoom] = useState<Room>();
  const [tmpID, setTmpID] = useState(-1);

  const groupRoomsByBuildingID = () => {
    return availableRooms.reduce((acc, room) => {
      const buildingID = room.building.ID;
      if (!acc[buildingID]) {
        acc[buildingID] = [];
      }
      acc[buildingID].push(room);
      return acc;
    }, {} as { [key: string]: Room[] });
  };

  // Fetch Available Rooms and Tutors
  useEffect(() => {
    const fetchData = async () => {
      const client = getClient(sid!);

      const vars: TutorialAvailabilitysQueryVariables = {
        id: id!,
      };

      const eventData = await client.request<TutorialAvailabilitysQuery>(
        TutorialAvailabilitysDocument,
        vars
      );

      setAvailableTutors(
        eventData.events[0].tutorsAvailable?.map((t) => ({
          ...defaultUser,
          ...t,
        })) ?? []
      );

      setAvailableRooms(
        eventData.events[0].roomsAvailable?.map((r) => ({
          ...defaultRoom,
          ...r,
        })) ?? []
      );
    };

    fetchData();
  }, []);

  const handleAvailableRoomsChange = (
    newRoom: Room | undefined,
    oldRoom: Room | undefined
  ) => {
    if (newRoom !== oldRoom) {
      setAvailableRooms((prev) => {
        const newRooms = prev.filter(
          (r) =>
            !(
              r.number === newRoom?.number &&
              r.building.ID === newRoom?.building.ID
            )
        );
        if (oldRoom) {
          newRooms.push(oldRoom);
        }
        return newRooms;
      });
    } else if (oldRoom) {
      setAvailableRooms((prev) => [...prev, oldRoom]);
    }
  };

  const groupedRooms = groupRoomsByBuildingID();

  return (
    <div className="rounded-md border overflow-hidden overflow-y-auto max-h-[25vh]">
      <Table>
        <TableBody>
          {tutorials && tutorials.length ? (
            <>
              {tutorials.map((e, i) => {
                const utilization = (e.registrationCount / e.capacity) * 100;

                return (
                  <TableRow key={e.room?.number} className="relative">
                    <div
                      className="light:hidden absolute inset-0 z-0"
                      style={{
                        width: `${utilization}%`,
                        backgroundColor: `${
                          utilization < 100 ? "#024b30" : "#8b0000"
                        }`,
                      }}
                    />
                    <div
                      className="dark:hidden absolute inset-0 z-0"
                      style={{
                        width: `${utilization}%`,
                        backgroundColor: `${
                          utilization < 100 ? "#BBF7D0" : "#FECACA"
                        }`,
                      }}
                    />
                    <TableCell className="relative z-1">
                      <TutorSelection
                        selectedTutors={e.tutors ?? undefined}
                        availableTutors={availableTutors}
                        onSelectedTutorsChange={(tutors) =>
                          setTutorialsAction((prev) => {
                            prev[i].tutors = tutors;
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="relative z-1">
                      <RoomSelection
                        groupedRooms={groupedRooms}
                        selectedRoom={e.room}
                        onSelectedRoomChange={(room) => {
                          const oldRoom = e.room;
                          handleAvailableRoomsChange(room, oldRoom);

                          if (room !== oldRoom) {
                            setTutorialsAction((prev) => {
                              prev[i].room = room ?? oldRoom;
                              return prev;
                            });
                          }

                          setTutorialsAction((prev) =>
                            prev.map((t) =>
                              t.ID === e.ID
                                ? { ...t, capacity: room?.capacity ?? 0 }
                                : t
                            )
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="relative z-1">
                      <MarkdownEditPopover
                        value={e.description ?? ""}
                        onSave={(input) =>
                          setTutorialsAction((prev) =>
                            prev.map((t) =>
                              t.ID === e.ID ? { ...t, description: input } : t
                            )
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="relative z-1">
                      <div className="flex flex-row gap-x-2 items-center w-20">
                        <div>
                          {e.registrationCount}/
                          <NumericInput
                            className="w-7 focus-visible:outline-none"
                            value={e.capacity}
                            onChange={(val) =>
                              setTutorialsAction((prev) =>
                                prev.map((t) =>
                                  t.ID === e.ID
                                    ? { ...t, capacity: val ?? 0 }
                                    : t
                                )
                              )
                            }
                          />
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <MessageCircleQuestionMark className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent className="w-[250px] flex flex-row gap-x-2 items-center">
                            <Info className="size-4" />
                            <p className="flex-1">
                              Passe die Raumkapazität an. Diese Änderung
                              betrifft nur dieses Tutorium und geht nicht
                              darüber hinaus.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="relative z-1">
                      <Button
                        variant={"ghost"}
                        onClick={() => {
                          setTutorialsAction((prev) =>
                            prev.filter((t) => t.ID !== e.ID)
                          );
                          handleAvailableRoomsChange(undefined, e.room);
                        }}
                      >
                        <SquareMinus className="stroke-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Für diese Veranstaltung existieren noch keine Anmeldungen.
              </TableCell>
            </TableRow>
          )}
          <TableRow className="light:bg-gray-100 dark:bg-gray-900">
            <div />
            <TableCell colSpan={2}>
              <TutorSelection
                availableTutors={availableTutors}
                selectedTutors={newTutorialTutors}
                onSelectedTutorsChange={(tutors) =>
                  setNewTutorialTutors(tutors)
                }
              />
            </TableCell>
            <TableCell colSpan={2}>
              <RoomSelection
                groupedRooms={groupedRooms}
                selectedRoom={newTutorialRoom}
                onSelectedRoomChange={(room) => {
                  const oldRoom = newTutorialRoom;

                  handleAvailableRoomsChange(room, oldRoom);

                  if (room !== oldRoom) {
                    if (oldRoom) {
                      setAvailableRooms((prev) => [...prev, oldRoom]);
                    }
                    setNewTutorialRoom(room);
                  } else {
                    setNewTutorialRoom(undefined);
                  }
                }}
              />
            </TableCell>
            <TableCell>
              <Button
                disabled={!newTutorialRoom || !newTutorialTutors.length}
                onClick={() => {
                  if (newTutorialRoom) {
                    setTutorialsAction((prev) => [
                      ...prev,
                      {
                        ...defaultTutorial,
                        ID: tmpID,
                        tutors: newTutorialTutors,
                        room: newTutorialRoom,
                        capacity: newTutorialRoom.capacity ?? 0,
                      },
                    ]);
                  }
                  setNewTutorialRoom(undefined);
                  setNewTutorialTutors([]);
                  setTmpID(tmpID - 1);
                }}
              >
                <Plus />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

interface MarkdownEditPopoverProps {
  value: string;
  onSave: (input: string) => void;
}

function MarkdownEditPopover({ value, onSave }: MarkdownEditPopoverProps) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <p className="line-clamp-3 w-[100px] cursor-pointer text-xs">
          <Markdown>{value ? value : "Beschreibung hinzufügen"}</Markdown>
        </p>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <Tabs defaultValue="plain">
          <div className="flex flex-row justify-between">
            <TabsList>
              <TabsTrigger value="plain">Markdown</TabsTrigger>
              <TabsTrigger value="preview">Vorschau</TabsTrigger>
            </TabsList>
            <Button
              onClick={() => {
                onSave(input);
                setOpen(false);
              }}
            >
              <Save />
            </Button>
          </div>
          <TabsContent value="plain">
            <Textarea
              placeholder="Beschreibung des Events"
              defaultValue={value}
              onChange={(e) => setInput(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="preview" className="text-xs">
            <Markdown>{input}</Markdown>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
