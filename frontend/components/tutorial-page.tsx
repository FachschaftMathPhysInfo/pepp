"use client";

import {useRefetch, useUser} from "@/components/providers";
import {TableSkeleton} from "@/components/table-skeleton";
import {
  DeleteStudentRegistrationForTutorialDocument,
  DeleteStudentRegistrationForTutorialMutation,
  DeleteStudentRegistrationForTutorialMutationVariables,
  Event,
  EventCloseupDocument,
  EventCloseupQuery,
  Tutorial,
  TutorialDetailDocument,
  TutorialDetailQuery,
  User,
} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";
import {defaultBuilding, defaultEvent, defaultRoom, defaultTutorial, defaultUser,} from "@/types/defaults";
import {useEffect, useState} from "react";
import {StudentsTable} from "@/components/tables/students-table/students-table";
import EventDescription from "@/components/dialog/events/event-description";
import {toast} from "sonner";
import {Separator} from "@/components/ui/separator";
import {RoomDetail} from "@/components/room-detail";
import ConfirmationDialog from "@/components/confirmation-dialog";

interface TutorialPageProps {
  onlyCurrentUser?: boolean
  eventID: number;
}

export interface StudentTableDialogState {
  currentUser: User;
  isOpen: boolean;
}

export function TutorialPage({eventID, onlyCurrentUser = false}: TutorialPageProps) {
  const {sid, user} = useUser();
  const {refetchKey, triggerRefetch} = useRefetch();

  const [loading, setLoading] = useState(true);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [currentTutorialID, setCurrentTutorialID] = useState(0);
  const [dialogState, setDialogState] = useState<StudentTableDialogState>({
    currentUser: defaultUser,
    isOpen: false,
  });

  useEffect(() => {
      if (!user) return;

      const fetchTutorials = async () => {
        setLoading(true);

        if (!user && onlyCurrentUser) return;

        if (onlyCurrentUser) await fetchTutorialsOfUser()
        else await fetchAllTutorialsOfEvent()

        setLoading(false);
      };

      void fetchTutorials();
    }, [eventID, sid, user, refetchKey]);

  async function fetchAllTutorialsOfEvent() {
    const client = getClient(sid!)

    try {
      const tutorialsData = await client.request<EventCloseupQuery>(
        EventCloseupDocument,
        {id: eventID}
      )

      const currentEvent = tutorialsData.events[0]
      if (!currentEvent) return

      const tutorials: Tutorial[] = currentEvent.tutorials?.map(tutorial => ({
        ...defaultTutorial,
        ...tutorial,
        tutors: tutorial.tutors?.map(tutor => ({
          ...defaultUser,
          ...tutor
        })),
        students: tutorial.students?.map(student => ({
          ...defaultUser,
          ...student,
        }))
      })) ?? []

      setTutorials(tutorials);
      setEvent({
        ...defaultEvent,
        ...currentEvent,
        tutorials: tutorials,
        umbrella: {...defaultEvent, ...currentEvent.umbrella, registrationForm: null}
      })
    } catch {
      toast.error("Beim Laden der Tutoriendaten ist ein Fehler aufgetreten.");
    }
  }

  async function fetchTutorialsOfUser() {
    const client = getClient(sid!)

    try {
      const tutorialsData = await client.request<TutorialDetailQuery>(
        TutorialDetailDocument,
        {eventID: eventID, tutorID: [user?.ID]}
      )

      setTutorials(
        tutorialsData.tutorials.map((t) => ({
          ...defaultTutorial,
          ...t,
          room: {
            ...defaultRoom,
            ...t.room,
            building: {...defaultBuilding, ...t.room.building},
          },
          students: t.students?.map((s) => ({...defaultUser, ...s})),
        }))
      );
      setEvent({...defaultEvent, ...tutorialsData.events[0]});
    } catch {
      toast.error("Beim Laden der Tutoriendaten ist ein Fehler aufgetreten.");
    }
  }

  async function handleRemoveUser() {
    const client = getClient(sid!);
    const vars: DeleteStudentRegistrationForTutorialMutationVariables = {
      registration: {
        userID: dialogState.currentUser.ID,
        tutorialID: currentTutorialID,
      },
    };

    try {
      await client.request<DeleteStudentRegistrationForTutorialMutation>(
        DeleteStudentRegistrationForTutorialDocument,
        vars
      );
      toast.info(
        `"${dialogState.currentUser.fn}" erfolgreich aus Tutorium entfernt.`
      );
      triggerRefetch();
    } catch {
      toast.error("Beim Entfernen des Studis ist ein Fehler aufgetreten.");
    }
  }

  return (
    <>
      <section className="space-y-2">
        <EventDescription event={event}/>
      </section>
      <Separator className="mt-4 mb-4"/>
      <section className="space-y-4">
        {loading ? (
          <TableSkeleton/>
        ) : (
          tutorials.map((t, i) => (
            <div
              key={t.ID}
              className="space-y-4"
              onClick={() => setCurrentTutorialID(t.ID)}
            >
              <RoomDetail room={t.room} className="flex flex-row space-x-4"/>
              <StudentsTable
                data={t.students ?? []}
                setDialogState={setDialogState}
              />
              {i + 1 !== tutorials.length && <Separator/>}
            </div>
          ))
        )}
      </section>

      <ConfirmationDialog
        description={`Dies wird ${dialogState.currentUser.fn} ${dialogState.currentUser.sn} aus dem Tutorium entfernen`}
        isOpen={dialogState.isOpen}
        closeDialog={() =>
          setDialogState({
            currentUser: dialogState.currentUser,
            isOpen: false,
          })
        }
        onConfirm={handleRemoveUser}
        mode={"confirmation"}
      />
    </>
  );
}
