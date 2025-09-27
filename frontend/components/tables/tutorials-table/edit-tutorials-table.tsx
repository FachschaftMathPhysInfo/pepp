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
import { Plus, SquareMinus } from "lucide-react";
import { getClient } from "@/lib/graphql";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "../../ui/table";
import { TutorSelection } from "./tutor-selection";
import { RoomSelection } from "./room-selection";
import {useUser} from "@/components/provider/user-provider";

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
                const utilization =
                  (e.registrationCount / (e.room.capacity ?? 1)) * 100;

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
                        }}
                      />
                    </TableCell>
                    <TableCell className="relative z-1">
                      {e.registrationCount}/
                      {e.room.capacity ? e.room.capacity : "?"}
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
            <TableCell>
              <TutorSelection
                availableTutors={availableTutors}
                selectedTutors={newTutorialTutors}
                onSelectedTutorsChange={(tutors) =>
                  setNewTutorialTutors(tutors)
                }
              />
            </TableCell>
            <TableCell>
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
            <TableCell colSpan={2}>
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
