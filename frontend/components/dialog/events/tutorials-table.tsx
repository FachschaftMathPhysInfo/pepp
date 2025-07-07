"use client";

import { defaultRoom, defaultTutorial, defaultUser } from "@/types/defaults";
import { Button } from "@/components/ui/button";
import {
  AddStudentApplicationForEventMutation,
  AddStudentRegistrationForTutorialDocument,
  AddStudentRegistrationForTutorialMutationVariables,
  DeleteStudentRegistrationForTutorialDocument,
  DeleteStudentRegistrationForTutorialMutation,
  DeleteStudentRegistrationForTutorialMutationVariables,
  Event,
  Room,
  Tutorial,
  TutorialAvailabilitysDocument,
  TutorialAvailabilitysQuery,
  TutorialAvailabilitysQueryVariables,
  User,
} from "@/lib/gql/generated/graphql";
import { Loader2, Plus, SquareMinus } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { MailLinkWithLabel } from "@/components/email-link";
import { useUser } from "../../providers";
import { getClient } from "@/lib/graphql";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "../../ui/table";
import { TutorSelection } from "../tutors/tutor-selection";
import { RoomSelection } from "../locations/room-selection";
import { RoomHoverCard } from "../../room-hover-card";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

interface TutorialsTableProps {
  id: number;
  capacities: number[];
  edit: boolean;
  event: Event;
  tutorials: Tutorial[];
  setTutorialsAction: React.Dispatch<React.SetStateAction<Tutorial[]>>;
}

export function TutorialsTable({
  event,
  tutorials,
  capacities,
  edit,
  id,
  setTutorialsAction,
}: TutorialsTableProps) {
  const router = useRouter();

  const { user, setUser, sid } = useUser();
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Tutorial | undefined>();
  const [usersTutorials, setUsersTutorials] = useState<Tutorial[]>();
  const [cap, setCap] = useState<number[]>(capacities);
  const [availableTutors, setAvailableTutors] = useState<User[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [newTutorialTutors, setNewTutorialTutors] = useState<User[]>([]);
  const [newTutorialRoom, setNewTutorialRoom] = useState<Room>();
  const [tmpID, setTmpID] = useState(-1);

  useEffect(() => {
    if (!user) return;
    setRegistration(user.registrations?.find((r) => r.event.ID === id));
    setUsersTutorials(user.tutorials?.filter((t) => t.event.ID === id));
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
  }, [edit]);

  const registerForTutorial = async (tutorial: Tutorial) => {
    const client = getClient(sid!);

    const vars: AddStudentRegistrationForTutorialMutationVariables = {
      registration: {
        tutorialID: tutorial.ID,
        userID: user!.ID,
      },
    };

    try {
      await client.request<AddStudentApplicationForEventMutation>(
        AddStudentRegistrationForTutorialDocument,
        vars
      );
    } catch {
      toast.error(
        "Beim Eintragen in eine Veranstaltung ist ein Fehler aufgetreten."
      );
    }
  };

  const unregisterFromTutorial = async (tutorial: Tutorial) => {
    const client = getClient(sid!);

    const vars: DeleteStudentRegistrationForTutorialMutationVariables = {
      registration: {
        tutorialID: tutorial.ID,
        userID: user!.ID,
      },
    };

    try {
      await client.request<DeleteStudentRegistrationForTutorialMutation>(
        DeleteStudentRegistrationForTutorialDocument,
        vars
      );
    } catch {
      toast.error(
        "Beim Austragen aus einer Veranstaltung ist ein Fehler aufgetreten."
      );
    }
  };

  const handleRegistrationChange = async (clickedTutorial: Tutorial) => {
    setLoading(true);

    if (registration) {
      if (clickedTutorial.ID === registration.ID) {
        //
        // unregister from tutorial
        //
        await unregisterFromTutorial(registration);

        setUser({
          ...user!,
          registrations: user?.registrations?.filter((r) => r.event.ID !== id),
        });

        setTutorialsAction(
          tutorials.map((t) => {
            if (t.ID === clickedTutorial.ID) {
              t.registrationCount -= 1;
            }
            return t;
          })
        );
      } else {
        //
        // change to different tutorial
        //
        await unregisterFromTutorial(registration);
        await registerForTutorial(clickedTutorial);

        setUser({
          ...user!,
          registrations: user!.registrations?.map((t) => {
            if (t.event.ID === id) {
              t = clickedTutorial;
            }
            return t;
          }),
        });

        setTutorialsAction(
          tutorials.map((t) => {
            if (t.ID === clickedTutorial.ID) {
              t.registrationCount += 1;
            } else if (t.ID === registration.ID) {
              t.registrationCount -= 1;
            }
            return t;
          })
        );
      }
    } else {
      //
      // initial registration for tutorial
      //
      await registerForTutorial(clickedTutorial);

      setUser({
        ...user!,
        registrations: (user!.registrations || []).concat(clickedTutorial),
      });

      setTutorialsAction(
        tutorials.map((t) => {
          if (t.ID === clickedTutorial.ID) {
            t.registrationCount += 1;
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
          {tutorials && tutorials.length ? (
            <>
              {tutorials.map((e, i) => {
                const capacity = cap[i];
                const utilization = (e.registrationCount / capacity) * 100;
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
                          selectedTutors={e.tutors ?? undefined}
                          availableTutors={availableTutors}
                          onSelectedTutorsChange={(tutors) =>
                            setTutorialsAction((prev) => {
                              prev[i].tutors = tutors;
                              return prev;
                            })
                          }
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
                          selectedRoom={e.room}
                          onSelectedRoomChange={(room) => {
                            const oldRoom = e.room;
                            handleAvailableRoomsChange(room, oldRoom);

                            if (room !== oldRoom) {
                              setCap((prev) => {
                                prev[i] = room?.capacity ?? 1;
                                return prev;
                              });
                              setTutorialsAction((prev) => {
                                prev[i].room = room ?? oldRoom;
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
                      {e.registrationCount}/{capacity !== 0 ? capacity : "?"}
                    </TableCell>
                    <TableCell className="relative z-1">
                      {edit ? (
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
                      ) : (
                        <Button
                          className="w-full"
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
                              router.push(
                                `/profile/tutorials/${slugify(event.title)}-${
                                  event.ID
                                }`
                              );
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
                    setCap((prev) => [...prev, newTutorialRoom?.capacity ?? 1]);
                    setNewTutorialRoom(undefined);
                    setNewTutorialTutors([]);
                    setTmpID(tmpID - 1);
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
