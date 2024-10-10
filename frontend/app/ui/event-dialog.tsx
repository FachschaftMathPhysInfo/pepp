"use client";

import {
  AddStudentApplicationForEventMutationVariables,
  AddStudentRegistrationForEventDocument,
  AddStudentRegistrationForEventMutation,
  AddStudentRegistrationForEventMutationVariables,
  DeleteStudentRegistrationForEventDocument,
  DeleteStudentRegistrationForEventMutation,
  DeleteStudentRegistrationForEventMutationVariables,
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  NewUserToEventRegistration,
  UserEventRegistrationDocument,
  UserEventRegistrationQuery,
  UserEventRegistrationQueryVariables,
  UserToEventRegistration,
} from "@/lib/gql/generated/graphql";
import { client } from "@/lib/graphClient";
import React, { useEffect, useState } from "react";
import { Mail, Building2, ArrowDownToDot, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Dialog,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import MapPreview from "@/components/map-preview";
import { useUser } from "../providers";
import { SignInDialog } from "@/components/sign-in-dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

export default function EventDialog({ id }: { id: number }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [registration, setRegistration] = useState<
    UserEventRegistrationQuery["registrations"][0] | null
  >(null);
  const [event, setEvent] = useState<EventCloseupQuery["events"][0] | null>(
    null
  );
  const [registrations, setRegistrations] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);

      const vars: EventCloseupQueryVariables = {
        id: id,
      };

      await new Promise((resolve) => setTimeout(resolve, 250));

      const eventData = await client.request<EventCloseupQuery>(
        EventCloseupDocument,
        vars
      );

      if (eventData.events.length) {
        setEvent(eventData.events[0]);
        setRegistrations(
          eventData.events[0].tutorsAssigned?.map(
            (t) => t.registrations ?? 0
          ) || []
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setRegLoading(true);

      const vars: UserEventRegistrationQueryVariables = {
        id: id,
        email: user.mail,
      };

      await new Promise((resolve) => setTimeout(resolve, 250));

      const regData = await client.request<UserEventRegistrationQuery>(
        UserEventRegistrationDocument,
        vars
      );

      if (regData.registrations.length) {
        setRegistration(regData.registrations[0]);
      }

      setRegLoading(false);
    };

    fetchData();
  }, [user, id]);

  const registerForEvent = async (
    reg: NewUserToEventRegistration,
    i: number
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const vars: AddStudentRegistrationForEventMutationVariables = {
      registration: reg,
    };

    const regData =
      await client.request<AddStudentRegistrationForEventMutation>(
        AddStudentRegistrationForEventDocument,
        vars
      );

    changeRegistrationCount(i, 1);
    setRegistration(regData.addStudentRegistrationForEvent);
  };

  const unregisterFromEvent = async (reg: NewUserToEventRegistration) => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const vars: DeleteStudentRegistrationForEventMutationVariables = {
      registration: reg,
    };

    await client.request<DeleteStudentRegistrationForEventMutation>(
      DeleteStudentRegistrationForEventDocument,
      vars
    );

    event?.tutorsAssigned?.forEach((e, i) => {
      if (e.room?.number === registration?.room.number && e.room?.building.ID) {
        changeRegistrationCount(i, -1);
      }
    });
  };

  const changeRegistrationCount = (index: number, value: number) => {
    setRegistrations((prevRegistrations) =>
      prevRegistrations.map((reg, i) => (i === index ? reg + value : reg))
    );
  };

  const handleRegistrationChange = async (
    reg: NewUserToEventRegistration,
    i: number
  ) => {
    setRegLoading(true);
    if (registration) {
      if (
        reg.roomNumber === registration.room.number &&
        reg.buildingID === registration.room.building.ID
      ) {
        await unregisterFromEvent(reg);
        setRegistration(null);
      } else {
        await unregisterFromEvent({
          eventID: event?.ID ?? 0,
          roomNumber: registration.room.number,
          buildingID: registration.room.building.ID,
          userMail: user?.mail ?? "",
        });
        await registerForEvent(reg, i);
      }
    } else {
      await registerForEvent(reg, i);
    }
    setRegLoading(false);
  };

  return (
    <DialogContent className="sm:max-w-[550px]">
      {loading ? (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>{event?.title}</DialogTitle>
            <DialogDescription>
              {event?.description}
              <div className="space-x-2 mt-2">
                <Badge variant="event" color={event?.topic.color}>
                  {event?.topic.name}
                </Badge>
                <Badge variant="event" color={event?.type.color}>
                  {event?.type.name}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>

          {!user && (
            <div>
              <span>Bitte </span>
              <Dialog>
                <DialogTrigger asChild>
                  <span className="cursor-pointer text-blue-500 hover:underline">
                    anmelden
                  </span>
                </DialogTrigger>
                <SignInDialog />
              </Dialog>
              <span>, um dich eintragen zu können.</span>
            </div>
          )}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableBody>
                {event?.tutorsAssigned?.map((e, i) => {
                  const capacity = e.room?.capacity ?? 1;
                  const utilization = (registrations[i] / capacity) * 100;

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
                        {e.tutors?.map((t) => (
                          <HoverCard key={t.mail}>
                            <HoverCardTrigger asChild>
                              <p className="hover:underline">
                                {t.fn + " " + t.sn[0] + "."}
                              </p>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="mb-1 text-xs text-muted-foreground">
                                {t.fn + " " + t.sn}
                              </p>
                              <div className="flex flex-row items-center">
                                <Mail className="mr-2 h-4 w-4 opacity-70" />
                                <a
                                  href={"mailto:" + t.mail}
                                  className="hover:underline text-blue-500"
                                >
                                  {t.mail}
                                </a>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </TableCell>
                      <TableCell className="relative z-1">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="group">
                              <p className="text-xs text-muted-foreground group-hover:underline">
                                {e.room?.building.name}
                              </p>
                              <p className="group-hover:underline">
                                {e.room?.name ? e.room.name : e.room?.number}
                              </p>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="min-w-[400px] p-0 flex flex-row">
                            <div className="p-4 space-y-4">
                              <div className="flex flex-row space-x-2">
                                <Building2 className="h-5 w-5" />
                                <div>
                                  <p className="font-bold">
                                    {e.room?.building.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {e.room?.building.street +
                                      " " +
                                      e.room?.building.number}
                                  </p>
                                  <div className="flex flex-row space-x-1 text-xs text-muted-foreground">
                                    <p>{e.room?.building.zip},</p>
                                    <p>{e.room?.building.city}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-row space-x-2">
                                <ArrowDownToDot className="h-5 w-5" />
                                <div>
                                  <p className="font-bold">
                                    {e.room?.name
                                      ? e.room.name
                                      : e.room?.number}
                                  </p>
                                  {e.room?.name && (
                                    <p className="text-xs text-muted-foreground">
                                      {e.room?.number}
                                    </p>
                                  )}
                                  {e.room?.floor !== null && (
                                    <p className="text-xs text-muted-foreground">
                                      Ebene {e.room?.floor}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <MapPreview
                              height="100%"
                              width="100%"
                              latitude={e.room?.building.latitude ?? 0}
                              longitude={e.room?.building.longitude ?? 0}
                              zoom={e.room?.building.zoomLevel}
                              className="rounded-tr-lg rounded-br-lg"
                            />
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell className="relative z-1">
                        <p>
                          {registrations[i]}/{capacity}
                        </p>
                      </TableCell>
                      <TableCell className="relative z-1">
                        <Button
                          disabled={utilization == 100 || !user || regLoading}
                          variant="outline"
                          onClick={() => {
                            handleRegistrationChange(
                              {
                                userMail: user?.mail ?? "",
                                eventID: event.ID,
                                roomNumber: e.room?.number ?? "",
                                buildingID: e.room?.building.ID ?? 0,
                              },
                              i
                            );
                          }}
                        >
                          {regLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {registration
                            ? e.room?.number === registration.room.number &&
                              e.room.building.ID ===
                                registration.room.building.ID
                              ? "Abmelden"
                              : "Wechseln"
                            : "Anmelden"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DialogContent>
  );
}
