"use client";

import {Button} from "@/components/ui/button";
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
  Tutorial,
} from "@/lib/gql/generated/graphql";
import {Loader2} from "lucide-react";
import {HoverCard, HoverCardContent, HoverCardTrigger,} from "../../ui/hover-card";
import {MailLinkWithLabel} from "@/components/email-link";
import {useUser} from "../../providers";
import {getClient} from "@/lib/graphql";
import React, {useCallback, useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableRow} from "../../ui/table";
import {RoomHoverCard} from "../../room-hover-card";
import {useRouter} from "next/navigation";
import {slugify} from "@/lib/utils";
import {toast} from "sonner";
import {defaultEvent, defaultTutorial, defaultUser} from "@/types/defaults";
import {Skeleton} from "@/components/ui/skeleton";
import {AuthenticationDialog} from "@/components/dialog/authentication/authentication-dialog";

interface TutorialsTableProps {
  event: Event;
}

export function TutorialsTable({event}: TutorialsTableProps) {
  const router = useRouter();
  const client = getClient();

  const {user, setUser, sid} = useUser();
  const [loading, setLoading] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Tutorial | undefined>();
  const [usersTutorials, setUsersTutorials] = useState<Tutorial[]>();
  const [tutorials, setTutorials] = useState<Tutorial[]>();
  const [authenticationDialogOpen, setAuthenticationDialogOpen] = useState(false);

  const fetchTutorials = useCallback(async () => {
    try {
      const tutorialData = await client.request<EventTutorialsQuery>(
        EventTutorialsDocument,
        {id: event.ID}
      );
      setTutorials(
        tutorialData.tutorials.map((t) => ({
          ...defaultTutorial,
          ...t,
          tutors: t.tutors?.map(
            (u) => ({...defaultUser, ...u})
          ),
          event: {...defaultEvent, ...t.event},
        }))
      );
    } catch {
      toast.error("Beim laden der Tutorien ist ein Fehler aufgetreten.");
    }
  }, [event.ID])
  const setTutorialsforUser = useCallback(() => {
    if (!user) return;
    setCurrentRegistration(user.registrations?.find((r) => r.event.ID === event.ID));
    setUsersTutorials(user.tutorials?.filter((t) => t.event.ID === event.ID));
  }, [user, event.ID, tutorials])

  useEffect(() => {
    void fetchTutorials();
  }, [user, event.ID]);

  useEffect(() => {
    void setTutorialsforUser()
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


  if (!tutorials) return <Skeleton/>;

  return (
    <>
      {!user && (
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
      {user && !event.tutorialsOpen && "Die Anmeldungen zu den Tutorien ist aktuell geschlossen. Bitte warte bis die Anmeldung freigegeben wird."}
      <div className="rounded-md border overflow-hidden relative">
        <Table>
          <TableBody>
            {loading && (
              <div className={'w-full h-full absolute flex items-center justify-center z-10'}>
                <div>
                  <Loader2 size={16} className={'animate-spin mr-2'}/>
                  Aktualisiere
                </div>
              </div>
            )}
            {tutorials && tutorials.length ? (
              <>
                {tutorials.map((rowTutorial) => {
                  const utilization = (rowTutorial.registrationCount / (rowTutorial.room.capacity ?? 1)) * 100;
                  const isRegisteredEvent = rowTutorial.ID === currentRegistration?.ID;
                  const isTutor = !!usersTutorials?.find(
                    userTutorial => userTutorial.ID === rowTutorial?.ID
                  );

                  return (
                    <TableRow key={rowTutorial.room?.number} className="relative">
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
                        {rowTutorial.tutors?.map((t) => (
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
                      </TableCell>
                      <TableCell className="relative z-1">
                        <RoomHoverCard room={rowTutorial.room}/>
                      </TableCell>
                      <TableCell className="relative z-1">
                        {rowTutorial.registrationCount}/{rowTutorial.room.capacity}
                      </TableCell>
                      <TableCell className="relative z-1">
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
                                `/profile/tutorials/${slugify(event.title)}-${
                                  event.ID
                                }`
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
    </>
  );
}
