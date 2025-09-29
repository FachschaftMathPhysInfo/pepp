"use client";

import { Button } from "@/components/ui/button";
import {
  AddStudentApplicationForEventMutation,
  AddStudentRegistrationForTutorialDocument,
  AddStudentRegistrationForTutorialMutationVariables,
  DeleteStudentRegistrationForTutorialDocument,
  DeleteStudentRegistrationForTutorialMutation,
  DeleteStudentRegistrationForTutorialMutationVariables,
  Event,
  EventTutorialsDocument,
  EventTutorialsQuery,
  Role,
  Tutorial,
} from "@/lib/gql/generated/graphql";
import { Info, Loader2, Lock } from "lucide-react";
import { MailLinkWithLabel } from "@/components/email-link";
import { useUser } from "../../providers";
import { getClient } from "@/lib/graphql";
import React, { useCallback, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "../../ui/table";
import { RoomHoverCard } from "../../room-hover-card";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthenticationDialog } from "@/components/dialog/authentication/authentication-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdaptiveHoverCardPopover from "@/components/adaptive-hovercard-popover";
import Markdown from "react-markdown";

interface TutorialsTableProps {
  event: Event;
}

export function TutorialsTable({ event }: TutorialsTableProps) {
  const router = useRouter();
  const client = getClient();

  const { user, setUser, sid } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<
    Tutorial | undefined
  >();
  const [usersTutorials, setUsersTutorials] = useState<Tutorial[]>();
  const [tutorials, setTutorials] = useState<Tutorial[]>();
  const [authenticationDialogOpen, setAuthenticationDialogOpen] =
    useState(false);

  const fetchTutorials = useCallback(async () => {
    try {
      const tutorialData = await client.request<EventTutorialsQuery>(
        EventTutorialsDocument,
        { id: event.ID }
      );
      setTutorials(
        tutorialData.tutorials.map((t) => ({
          ...defaultTutorial,
          ...t,
          tutors: t.tutors?.map((u) => ({ ...defaultUser, ...u })),
          event: { ...defaultEvent, ...t.event },
        }))
      );
    } catch {
      toast.error("Beim laden der Tutorien ist ein Fehler aufgetreten.");
    }
  }, [event.ID]);
  const setTutorialsforUser = useCallback(() => {
    if (!user) return;
    setCurrentRegistration(
      user.registrations?.find((r) => r.event.ID === event.ID)
    );
    setUsersTutorials(user.tutorials?.filter((t) => t.event.ID === event.ID));
  }, [user, event.ID, tutorials]);

  useEffect(() => {
    void fetchTutorials();
  }, [user, event.ID]);

  useEffect(() => {
    void setTutorialsforUser();
  }, [user, event.ID, tutorials]);

  const handleRegistrationChange = async (clickedTutorial: Tutorial) => {
    if (!user) return;
    setLoading(true);

    if (currentRegistration) {
      if (clickedTutorial.ID === currentRegistration.ID) {
        //
        // unregister from tutorial
        //
        await unregisterFromTutorial(currentRegistration);

        setUser({
          ...user,
          registrations: user.registrations?.filter(
            (r) => r.event.ID !== event.ID
          ),
        });

        setTutorials(
          tutorials?.map((t) => {
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
        await unregisterFromTutorial(currentRegistration);
        await registerForTutorial(clickedTutorial);

        setUser({
          ...user,
          registrations: user.registrations?.map((t) => {
            if (t.event.ID === event.ID) {
              t = clickedTutorial;
            }
            return t;
          }),
        });

        setTutorials(
          tutorials?.map((t) => {
            if (t.ID === clickedTutorial.ID) {
              t.registrationCount += 1;
            } else if (t.ID === currentRegistration.ID) {
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
        ...user,
        registrations: (user.registrations || []).concat(clickedTutorial),
      });

      setTutorials(
        tutorials?.map((t) => {
          if (t.ID === clickedTutorial.ID) {
            t.registrationCount += 1;
          }
          return t;
        })
      );
    }

    await fetchTutorials();
    setLoading(false);
  };

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
    } catch (error) {
      console.log(error);

      if (String(error).includes("capacity exceeded")) {
        toast.error(
          "Dieses Tutorial ist leider schon voll, trage dich gerne in ein anderes ein."
        );
        await fetchTutorials();
      } else {
        toast.error(
          "Beim Eintragen in eine Veranstaltung ist ein Fehler aufgetreten."
        );
      }
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

  if (!tutorials) return <Skeleton />;

  if (!(tutorials.length > 0) && user?.role !== Role.Admin) return null;

  return (
    <div className="space-y-4">
      {!user && event.registrationNeeded && (
        <div>
          <span>Bitte </span>
          <span
            className="cursor-pointer text-blue-500 hover:underline"
            onClick={() => setAuthenticationDialogOpen(true)}
          >
            anmelden
          </span>
          <span>, um dich eintragen zu können.</span>
        </div>
      )}

      {!event.tutorialsOpen &&
        event.registrationNeeded &&
        tutorials?.length > 1 && (
          <Alert variant="warning">
            <Lock className="size-4" />
            <AlertTitle>Die Anmeldung ist noch nicht offen</AlertTitle>
            <AlertDescription>
              Die Anmeldungen zu den Tutorien ist aktuell geschlossen. Bitte
              warte auf eine Freigabe durch die Admins.
            </AlertDescription>
          </Alert>
        )}

      <div className="rounded-md border overflow-hidden relative overflow-y-auto max-h-[30vh]">
        <Table>
          <TableBody>
            {loading && (
              <div
                className={
                  "w-full h-full absolute flex items-center justify-center z-10"
                }
              >
                <div>
                  <Loader2 size={16} className={"animate-spin mr-2"} />
                  Aktualisiere
                </div>
              </div>
            )}
            {tutorials && tutorials.length ? (
              <>
                {tutorials.map((rowTutorial) => {
                  const utilization =
                    (rowTutorial.registrationCount /
                      (rowTutorial.capacity ?? 1)) *
                    100;
                  const isRegisteredEvent =
                    rowTutorial.ID === currentRegistration?.ID;
                  const isTutor = !!usersTutorials?.find(
                    (userTutorial) => userTutorial.ID === rowTutorial?.ID
                  );

                  return (
                    <TableRow
                      key={rowTutorial.room?.number}
                      className="relative"
                      style={{
                        backgroundImage: event.registrationNeeded
                          ? `linear-gradient(to right, ${
                              utilization < 100
                                ? // theme did not wanna work here...
                                  document.documentElement.classList.contains(
                                    "dark"
                                  )
                                  ? "#024b30"
                                  : "#BBF7D0"
                                : document.documentElement.classList.contains(
                                    "dark"
                                  )
                                ? "#8b0000"
                                : "#FECACA"
                            } ${utilization}%, transparent ${utilization}%)`
                          : "transparent",
                      }}
                    >
                      <TableCell className="relative z-15">
                        {rowTutorial.tutors?.map((t) => (
                          <AdaptiveHoverCardPopover
                            trigger={
                              <p className="hover:underline truncate sm:w-full xs:max-w-20">
                                {`${t.fn} ${t.sn}`}
                              </p>
                            }
                            content={
                              <MailLinkWithLabel
                                mail={t.mail}
                                label={t.fn + " " + t.sn}
                              />
                            }
                          />
                        ))}
                      </TableCell>
                      <TableCell className="relative z-15">
                        <RoomHoverCard room={rowTutorial.room} />
                      </TableCell>
                      <TableCell className="relative z-15">
                        {rowTutorial.description && (
                          <AdaptiveHoverCardPopover
                            trigger={
                              <p className="line-clamp-2 w-[150px]">
                                <Markdown>{rowTutorial.description}</Markdown>
                              </p>
                            }
                            content={
                              <div className="flex flex-row gap-x-2 items-center">
                                <Info className="size-4" />
                                <div className="flex-1">
                                  <Markdown>{rowTutorial.description}</Markdown>
                                </div>
                              </div>
                            }
                          />
                        )}
                      </TableCell>
                      {event.registrationNeeded ? (
                        <>
                          <TableCell className="relative z-10">
                            {rowTutorial.registrationCount}/
                            {rowTutorial.capacity}
                          </TableCell>
                          <TableCell className="relative z-10">
                            <Button
                              className="w-full"
                              disabled={
                                (usersTutorials && !isTutor) ||
                                (!isRegisteredEvent && utilization == 100) ||
                                !user ||
                                !event.tutorialsOpen ||
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
                                    `/profile/tutorials/${slugify(
                                      event.title
                                    )}-${event.ID}`
                                  );
                                } else {
                                  void handleRegistrationChange(rowTutorial);
                                }
                              }}
                            >
                              {isTutor
                                ? "Verwalten"
                                : currentRegistration && user
                                ? isRegisteredEvent
                                  ? "Austragen"
                                  : "Wechseln"
                                : "Eintragen"}
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell
                          className="text-muted-foreground w-[150px]"
                          align="right"
                        >
                          Keine Anmeldung erforderlich
                        </TableCell>
                      )}
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
          </TableBody>
        </Table>
      </div>
      <AuthenticationDialog
        open={authenticationDialogOpen}
        closeDialog={() => setAuthenticationDialogOpen(false)}
      />
    </div>
  );
}
