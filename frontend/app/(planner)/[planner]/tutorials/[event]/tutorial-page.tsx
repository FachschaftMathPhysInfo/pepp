"use client";

import { useUser } from "@/components/provider/user-provider";

import { TableSkeleton } from "@/components/table-skeleton";
import {
  DeleteStudentRegistrationForTutorialDocument,
  DeleteStudentRegistrationForTutorialMutation,
  DeleteStudentRegistrationForTutorialMutationVariables,
  Event, EventDescriptionDocument,
  Tutorial, TutorialDetailDocument,
  User,
} from "@/lib/gql/generated/graphql";
import { getClient } from "@/lib/graphql";
import {
  defaultBuilding,
  defaultEvent,
  defaultRoom,
  defaultTutorial,
  defaultUser,
} from "@/types/defaults";
import { useEffect, useState } from "react";
import { StudentsTable } from "@/components/tables//students/students-table";
import EventDescription from "@/components/event-description";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { RoomDetail } from "@/components/room-detail";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {useRefetch} from "@/components/provider/refetch-provider";

interface TutorialPageProps {
  eventID: number;
}

export interface StudentTableDialogState {
  currentUser: User;
  isOpen: boolean;
}

export function TutorialPage({ eventID }: TutorialPageProps) {
  const { sid, user } = useUser();
  const { refetchKey, triggerRefetch } = useRefetch();

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
    const fetchTutorial = async () => {
      setLoading(true);

      const client = getClient(sid!);

      if(!user) return;

      try {
        const tutorialsData = await client.request(
          TutorialDetailDocument,
          {eventID: eventID}
        );

        setTutorials(
          tutorialsData.tutorials.map((t) => ({
            ...defaultTutorial,
            ...t,
            room: {
              ...defaultRoom,
              ...t.room,
              building: { ...defaultBuilding, ...t.room.building },
            },
            students: t.students?.map((s) => ({ ...defaultUser, ...s })),
          }))
        );

        const eventData = await client.request(EventDescriptionDocument, {id: eventID})
        setEvent({
          ...defaultEvent,
          ...eventData.events.find(e => e.ID === eventID)
        })
      } catch (err) {
        toast.error("Beim Laden der Tutoriendaten ist ein Fehler aufgetreten.");
        console.log(err);
      }

      setLoading(false);
    };

    void fetchTutorial();
  }, [eventID, sid, user, refetchKey]);

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
        <EventDescription event={event} />
      </section>
      <Separator className="mt-4 mb-4" />
      <section className="space-y-4">
        {loading ? (
          <TableSkeleton />
        ) : (
          tutorials.map((t, i) => (
            <div
              key={t.ID}
              className="space-y-4"
              onClick={() => setCurrentTutorialID(t.ID)}
            >
              <RoomDetail room={t.room} className="flex flex-row space-x-4" />
              <StudentsTable
                data={t.students ?? []}
                setDialogState={setDialogState}
              />
              {i + 1 !== tutorials.length && <Separator />}
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
