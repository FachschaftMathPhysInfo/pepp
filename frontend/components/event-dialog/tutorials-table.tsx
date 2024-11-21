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
import {
  ArrowDownToDot,
  Building2,
  Check,
  ChevronsUpDown,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import MapPreview from "../map-preview";
import { MailLinkWithLabel } from "../links/email";
import { useUmbrella, useUser } from "../providers";
import { client } from "@/lib/graphql";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { TutorSelection } from "./tutor-selection";
import { cn } from "@/lib/utils";
import { RoomSelection } from "./room-selection";
import { RoomHoverCard } from "../room-hover-card";

interface TutorialsTableProps {
  tutorials: EventTutorRoomPair[];
  registrationCounts: number[];
  capacities: number[];
  edit: boolean;
  setDeleteAssignments: React.Dispatch<
    React.SetStateAction<EventToUserAssignment[]>
  >;
  setNewAssignments: React.Dispatch<
    React.SetStateAction<EventToUserAssignment[]>
  >;
}

export function TutorialsTable({
  tutorials,
  registrationCounts,
  capacities,
  edit,
  setNewAssignments,
  setDeleteAssignments,
}: TutorialsTableProps) {
  const { user, registrations, setRegistrations } = useUser();
  const { closeupID } = useUmbrella();
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState(
    registrations.find((r) => r.event.ID === closeupID)
  );
  const [regCounts, setRegCounts] = useState<number[]>(registrationCounts);
  const [cap, setCap] = useState<number[]>(capacities);
  const [availableTutors, setAvailableTutors] = useState<User[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [updateRooms, setUpdateRooms] = useState<
    MutationUpdateRoomForTutorialArgs[]
  >([]);

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
          {tutorials.map((e, i) => {
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
                      tutorial={e}
                      availableTutors={availableTutors}
                      setDeleteAssignments={setDeleteAssignments}
                      setNewAssignments={setNewAssignments}
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
                      i={i}
                      setCapacities={setCap}
                      tutorial={e}
                      groupedRooms={groupedRooms}
                      setAvailableRooms={setAvailableRooms}
                      updateRooms={updateRooms}
                      setUpdateRooms={setUpdateRooms}
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
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
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
                        isRegisteredEvent && user ? "destructive" : "outline"
                      }
                      onClick={() => {
                        handleRegistrationChange(
                          e.room,
                          i
                        );
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
          {edit && (
            <TableRow className="bg-gray-100">
              <div />
              <TableCell>
                <TutorSelection
                  tutorial={null}
                  availableTutors={availableTutors}
                  setDeleteAssignments={setDeleteAssignments}
                  setNewAssignments={setNewAssignments}
                />
              </TableCell>
              <TableCell>
                <RoomSelection
                  tutorial={null}
                  groupedRooms={groupedRooms}
                  setAvailableRooms={setAvailableRooms}
                  updateRooms={updateRooms}
                  setUpdateRooms={setUpdateRooms}
                />
              </TableCell>
              <TableCell colSpan={2}>
                <Button>
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
