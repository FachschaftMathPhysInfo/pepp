"use client";

import { defaultRoom, defaultTutorial, defaultUser } from "@/types/defaults";
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
  Event,
  EventToUserAssignment,
  MutationUpdateRoomForTutorialArgs,
  Room,
  Tutorial,
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
import { getClient } from "@/lib/graphql";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { TutorSelection } from "./tutor-selection";
import { RoomSelection } from "./room-selection";
import { RoomHoverCard } from "../room-hover-card";
import { useRouter } from "next/navigation";
import {slugify} from "@/lib/utils";

interface TutorialsTableProps {
  tutorials: Tutorial[];
  capacities: number[];
  edit: boolean;
  event: Event;
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
  event,
  tutorials,
  capacities,
  edit,
}: TutorialsTableProps) {
  const router = useRouter();

  const { user, setUser, sid } = useUser();
  const { closeupID } = useUmbrella();
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Tutorial | undefined>();
  const [usersTutorials, setUsersTutorials] = useState<Tutorial[]>();
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
    setRegistration(user.registrations?.find((r) => r.event.ID === closeupID));
    setUsersTutorials(user.tutorials?.filter((t) => t.event.ID === closeupID));
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

  useEffect(() => {
    if (!edit) return;

    const fetchData = async () => {
      const client = getClient(sid!);

      const vars: TutorialAvailabilitysQueryVariables = {
        id: closeupID!,
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

      setSelectedRooms(tutorials.map((t) => t.room));

      setAvailableRooms(
        eventData.events[0].roomsAvailable
          ?.map((r) => ({
            ...defaultRoom,
            ...r,
          }))
          .filter((r) => tutorials.map((t) => t.room).includes(r)) ?? []
      );
    };

    fetchData();
  }, [edit]);

  const registerForEvent = async (tutorial: Tutorial) => {
    const client = getClient(sid!);

    const vars: AddStudentRegistrationForEventMutationVariables = {
      registration: {
        eventID: closeupID!,
        userMail: user!.mail,
        roomNumber: tutorial.room.number,
        buildingID: tutorial.room.building.ID,
      },
    };

    await client.request<AddStudentRegistrationForEventMutation>(
      AddStudentRegistrationForEventDocument,
      vars
    );
  };

  const unregisterFromEvent = async (tutorial: Tutorial) => {
    const client = getClient(sid!);

    const vars: DeleteStudentRegistrationForEventMutationVariables = {
      registration: {
        eventID: closeupID!,
        userMail: user!.mail,
        roomNumber: tutorial.room.number,
        buildingID: tutorial.room.building.ID,
      },
    };

    await client.request<DeleteStudentRegistrationForEventMutation>(
      DeleteStudentRegistrationForEventDocument,
      vars
    );
  };

  const isSameTutorial = (first: Tutorial, second: Tutorial) => {
    return (
      first.room.number === second.room.number &&
      first.room.building.ID === second.room.building.ID
    );
  };

  const handleRegistrationChange = async (tutorial: Tutorial) => {
    setLoading(true);

    if (registration) {
      if (isSameTutorial(tutorial, registration)) {
        await unregisterFromEvent(registration);

        setUser({
          ...user!,
          registrations: user?.registrations?.filter(
            (r) => r.event.ID !== tutorial.event.ID
          ),
        });

        setTuts(
          tuts.map((t) => {
            if (isSameTutorial(t, tutorial)) {
              t.registrations -= 1;
            }
            return t;
          })
        );
      } else {
        await unregisterFromEvent(registration);
        await registerForEvent(tutorial);

        setUser({
          ...user!,
          registrations: user!.registrations?.map((t) => {
            if (t.event.ID === tutorial.event.ID) {
              t = tutorial;
            }
            return t;
          }),
        });

        setTuts(
          tuts.map((t) => {
            if (isSameTutorial(t, tutorial)) {
              t.registrations += 1;
            } else if (isSameTutorial(t, registration)) {
              t.registrations -= 1;
            }
            return t;
          })
        );
      }
    } else {
      await registerForEvent(tutorial);

      setUser({
        ...user!,
        registrations: (user!.registrations || []).concat(tutorial),
      });

      setTuts(
        tuts.map((t) => {
          if (isSameTutorial(t, tutorial)) {
            t.registrations += 1;
          }
          return t;
        })
      );
    }

    setLoading(false);
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

  const groupedRooms = groupRoomsByBuildingID();

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableBody>
          {tuts.length ? (
            <>
              {tuts.map((e, i) => {
                const capacity = cap[i];
                const utilization = (e.registrations / capacity) * 100;
                const isRegisteredEvent =
                  e.room.number === registration?.room.number &&
                  e.room.building.ID === registration?.room.building.ID;
                const isTutor = usersTutorials?.find(
                  (t) =>
                    t.room.number === e.room.number &&
                    t.room.building.ID === e.room.building.ID
                )
                  ? true
                  : false;

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
                      {e.registrations}/{capacity !== 0 ? capacity : "?"}
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
                          disabled={
                            (usersTutorials && !isTutor) ||
                            (!isRegisteredEvent && utilization == 100) ||
                            !user ||
                            loading
                          }
                          variant={
                            isRegisteredEvent && user
                              ? "destructive"
                              : "outline"
                          }
                          onClick={() => {
                            if (isTutor) {
                              router.push(`/profile/tutorials/${slugify(event.title)}-${event.ID}`);
                            } else {
                              handleRegistrationChange(e);
                            }
                          }}
                        >
                          {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {isTutor
                            ? "Verwalten"
                            : registration && user
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
              <TableCell colSpan={4} className="h-24 text-center">
                Für diese Veranstaltung existieren noch keine Anmeldungen.
              </TableCell>
            </TableRow>
          )}
          {edit && (
            <TableRow className="light:bg-gray-100 dark:bg-gray-900">
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
                          ...defaultTutorial,
                          tutors: newTutorialTutors,
                          room: newTutorialRoom,
                        },
                      ]);
                    }
                    setCap((prev) => [...prev, newTutorialRoom?.capacity ?? 1]);
                    setSelectedRooms((prev) => [...prev, newTutorialRoom]);
                    setNewTutorialRoom(undefined);
                    setNewTutorialTutors([]);
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
