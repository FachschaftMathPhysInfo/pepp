"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AddStudentRegistrationForEventDocument,
  AddStudentRegistrationForEventMutation,
  AddStudentRegistrationForEventMutationVariables,
  DeleteStudentRegistrationForEventDocument,
  DeleteStudentRegistrationForEventMutation,
  DeleteStudentRegistrationForEventMutationVariables,
  EventRegistration,
  EventToUserAssignment,
  EventTutorRoomPair,
  MutationUpdateRoomForTutorialArgs,
  NewUserToEventRegistration,
  Room,
  TutorialAvailabilitysDocument,
  TutorialAvailabilitysQuery,
  TutorialAvailabilitysQueryVariables,
  User,
} from "@/lib/gql/generated/graphql";
import { Loader2, MoreVertical, Plus, Trash2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { MailLinkWithLabel } from "../links/email";
import { useUmbrella, useUser } from "../providers";
import { client } from "@/lib/graphql";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { TutorSelection } from "./tutor-selection";
import { RoomSelection } from "./room-selection";
import { RoomHoverCard } from "../room-hover-card";

interface TutorialsTableProps {
  tutorials: EventTutorRoomPair[];
  registrationCounts: number[];
  capacities: number[];
  edit: boolean;
  deleteAssignments: EventToUserAssignment[];
  setDeleteAssignments: React.Dispatch<
    React.SetStateAction<EventToUserAssignment[]>
  >;
  newAssignments: EventToUserAssignment[];
  setNewAssignments: React.Dispatch<
    React.SetStateAction<EventToUserAssignment[]>
  >;
}

export function TutorialsTable({
  tutorials,
  registrationCounts,
  capacities,
  edit,
  newAssignments,
  setNewAssignments,
  deleteAssignments,
  setDeleteAssignments,
}: TutorialsTableProps) {
  const { user, registrations, setRegistrations } = useUser();
  const { closeupID } = useUmbrella();
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<
    EventRegistration | undefined
  >();
  const [regCounts, setRegCounts] = useState<number[]>(registrationCounts);
  const [cap, setCap] = useState<number[]>(capacities);
  const [availableTutors, setAvailableTutors] = useState<User[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [updateRooms, setUpdateRooms] = useState<
    MutationUpdateRoomForTutorialArgs[]
  >([]);
  const [selectedRooms, setSelectedRooms] = useState<(Room | undefined)[]>([]);
  const [tuts, setTuts] = useState(tutorials);
  const [newTutorialTutors, setNewTutorialTutors] = useState<User[]>([]);
  const [newTutorialRoom, setNewTutorialRoom] = useState<Room>();

  useEffect(() => {
    if (!user) return;
    setRegistration(registrations.find((r) => r.event.ID === closeupID));
  }, [user]);

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

  const registerForEvent = async (
    reg: NewUserToEventRegistration,
    i: number,
    room: Room
  ) => {
    const vars: AddStudentRegistrationForEventMutationVariables = {
      registration: reg,
    };

    await client.request<AddStudentRegistrationForEventMutation>(
      AddStudentRegistrationForEventDocument,
      vars
    );

    changeRegistrationCount(i, 1);
    const newReg = {
      event: {
        ID: reg.eventID,
        title: "",
        topic: { name: "" },
        type: { name: "" },
        from: "",
        to: "",
        needsTutors: true,
      },
      room: room,
    };
    setRegistrations([...registrations, newReg]);
    setRegistration(newReg);
  };

  useEffect(() => {
    if (!edit) return;

    const fetchData = async () => {
      const vars: TutorialAvailabilitysQueryVariables = {
        id: closeupID ?? 0,
      };

      const eventData = await client.request<TutorialAvailabilitysQuery>(
        TutorialAvailabilitysDocument,
        vars
      );

      setAvailableTutors(
        eventData.events[0].tutorsAvailable?.map((t) => ({
          mail: t.mail,
          fn: t.fn,
          sn: t.sn,
          confirmed: true,
        })) ?? []
      );

      setSelectedRooms(tutorials.map((t) => t.room));

      setAvailableRooms(
        eventData.events[0].roomsAvailable
          ?.map((r) => ({
            number: r.number,
            name: r.name,
            building: {
              number: r.building.number,
              ID: r.building.ID,
              name: r.building.name,
              street: r.building.street,
              zip: r.building.zip,
              city: r.building.city,
              latitude: 0,
              longitude: 0,
              zoomLevel: 0,
            },
          }))
          .filter((r) => tutorials.map((t) => t.room).includes(r)) ?? []
      );
    };

    fetchData();
  }, [edit]);

  const unregisterFromEvent = async (reg: NewUserToEventRegistration) => {
    const vars: DeleteStudentRegistrationForEventMutationVariables = {
      registration: reg,
    };

    await client.request<DeleteStudentRegistrationForEventMutation>(
      DeleteStudentRegistrationForEventDocument,
      vars
    );

    tutorials.forEach((e, i) => {
      if (e.room?.number === registration?.room.number && e.room?.building.ID) {
        changeRegistrationCount(i, -1);
      }
    });
  };

  const changeRegistrationCount = (index: number, value: number) => {
    setRegCounts((prevRegistrations) =>
      prevRegistrations.map((reg, i) => (i === index ? reg + value : reg))
    );
  };

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

  const handleRegistrationChange = async (room: Room, i: number) => {
    setLoading(true);

    const reg = {
      userMail: user?.mail ?? "",
      eventID: closeupID ?? 0,
      roomNumber: room.number,
      buildingID: room.building.ID,
    };

    if (registration) {
      if (
        reg.roomNumber === registration.room.number &&
        reg.buildingID === registration.room.building.ID
      ) {
        await unregisterFromEvent(reg);
        setRegistration(undefined);
        setRegistrations(
          registrations.filter((r) => r.event.ID !== reg.eventID)
        );
      } else {
        await unregisterFromEvent({
          eventID: reg.eventID,
          roomNumber: registration.room.number,
          buildingID: registration.room.building.ID,
          userMail: user?.mail ?? "",
        });
        await registerForEvent(reg, i, room);
        setRegistrations(
          registrations.map((r) => {
            if (r.event.ID === reg.eventID) {
              r.room = room;
            }
            return r;
          })
        );
      }
    } else {
      await registerForEvent(reg, i, room);
    }
    setLoading(false);
  };

  const groupedRooms = groupRoomsByBuildingID();

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableBody>
          {tuts.length ? (
            <>
              {tuts.map((e, i) => {
                const capacity = cap[i];
                const utilization = (regCounts[i] / capacity) * 100;
                const isRegisteredEvent =
                  e.room?.number === registration?.room.number &&
                  e.room?.building.ID === registration?.room.building.ID;

                return (
                  <TableRow key={e.room?.number} className="relative">
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        width: `${utilization}%`,
                        backgroundColor: `${
                          utilization < 100 ? "#BBF7D0" : "#FECACA"
                        }`,
                      }}
                    />
                    <TableCell className="relative z-1">
                      {edit ? (
                        <TutorSelection
                          selectedTutors={e.tutors}
                          availableTutors={availableTutors}
                          onSelectedTutorsChange={(tutor) => {
                            const isAlreadySelectedTutor = e.tutors.find(
                              (t) => t.mail === tutor.mail
                            )
                              ? true
                              : false;
                            const assignment: EventToUserAssignment = {
                              eventID: closeupID ?? 0,
                              userMail: tutor.mail,
                              roomNumber: selectedRooms[i]?.number ?? "",
                              buildingID: selectedRooms[i]?.building.ID ?? 0,
                            };
                          }}
                        />
                      ) : (
                        <>
                          {e.tutors?.map((t) => (
                            <HoverCard key={t.mail}>
                              <HoverCardTrigger asChild>
                                <p className="hover:underline">
                                  {t.fn + " " + t.sn[0] + "."}
                                </p>
                              </HoverCardTrigger>
                              <HoverCardContent>
                                <MailLinkWithLabel
                                  mail={t.mail}
                                  label={t.fn + " " + t.sn}
                                />
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="relative z-1">
                      {edit ? (
                        <RoomSelection
                          groupedRooms={groupedRooms}
                          selectedRoom={selectedRooms[i]}
                          onSelectedRoomChange={(room) => {
                            const u = updateRooms.find(
                              (r) =>
                                r.oldBuildingID === room?.building.ID &&
                                r.oldRoomNumber === room?.number
                            );
                            const oldRoom = selectedRooms[i];

                            handleAvailableRoomsChange(room, oldRoom);

                            if (room !== oldRoom) {
                              setCap((prev) => {
                                prev[i] = room?.capacity ?? 1;
                                return prev;
                              });
                              setSelectedRooms((prev) => {
                                prev[i] = room;
                                return prev;
                              });
                              if (
                                room?.number !== e.room.number &&
                                room?.building.ID !== e.room.building.ID
                              ) {
                                if (u) {
                                  u.newRoomNumber = room!.number;
                                  u.newBuildingID = room!.building.ID;
                                } else {
                                  setUpdateRooms((prev) => [
                                    ...prev,
                                    {
                                      eventID: closeupID ?? 0,
                                      oldBuildingID: e.room.building.ID,
                                      oldRoomNumber: e.room.number,
                                      newBuildingID: room!.building.ID,
                                      newRoomNumber: room!.number,
                                    },
                                  ]);
                                }
                              } else {
                                setUpdateRooms((prev) =>
                                  prev.filter((r) => r !== u)
                                );
                              }
                            } else {
                              setCap((prev) => {
                                prev[i] = 0;
                                return prev;
                              });
                              setSelectedRooms((prev) => {
                                prev[i] = undefined;
                                return prev;
                              });
                            }
                          }}
                        />
                      ) : (
                        <RoomHoverCard room={e.room} />
                      )}
                    </TableCell>
                    <TableCell className="relative z-1">
                      {regCounts[i]}/{capacity !== 0 ? capacity : "?"}
                    </TableCell>
                    <TableCell className="relative z-1">
                      {edit ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Menü öffnen</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Optionen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2" /> Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          disabled={utilization == 100 || !user || loading}
                          variant={
                            isRegisteredEvent && user
                              ? "destructive"
                              : "outline"
                          }
                          onClick={() => {
                            handleRegistrationChange(e.room, i);
                          }}
                        >
                          {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {registration && user
                            ? isRegisteredEvent
                              ? "Austragen"
                              : "Wechseln"
                            : "Eintragen"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center">
                Noch keine Tutorien verfügbar.
              </TableCell>
            </TableRow>
          )}
          {edit && (
            <TableRow className="bg-gray-100">
              <div />
              <TableCell>
                <TutorSelection
                  availableTutors={availableTutors}
                  selectedTutors={newTutorialTutors}
                  onSelectedTutorsChange={(tutor) => {
                    const isSelected = newTutorialTutors.find(
                      (t) => t.mail === tutor.mail
                    )
                      ? true
                      : false;

                    if (isSelected) {
                      setNewTutorialTutors((prev) =>
                        prev.filter((t) => t.mail !== tutor.mail)
                      );
                    } else {
                      setNewTutorialTutors((prev) => [...prev, tutor]);
                    }
                  }}
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
                      setTuts((prev) => [
                        ...prev,
                        {
                          tutors: newTutorialTutors,
                          room: newTutorialRoom,
                          registrations: 0,
                        },
                      ]);
                    }
                    setCap((prev) => [...prev, newTutorialRoom?.capacity ?? 1]);
                    setSelectedRooms(prev => [...prev, newTutorialRoom])
                    setRegCounts(prev => [...prev, 0])
                    setNewTutorialRoom(undefined)
                    setNewTutorialTutors([])
                  }}
                >
                  <Plus />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
