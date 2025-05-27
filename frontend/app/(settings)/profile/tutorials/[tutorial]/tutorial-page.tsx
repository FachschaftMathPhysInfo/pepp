"use client";

import { useUser } from "@/components/providers";
import { TableSkeleton } from "@/components/table-skeleton";
import {
  Event,
  Tutorial,
  TutorialDetailDocument,
  TutorialDetailQuery,
  TutorialDetailQueryVariables,
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
import { StudentsTable } from "./students-table";
import { columns } from "./columns";
import EventDescription from "@/components/event-dialog/event-description";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { RoomDetail } from "@/components/room-detail";

interface TutorialPageProps {
  id: number;
}

export function TutorialPage({ id }: TutorialPageProps) {
  const { sid, user } = useUser();

  const [loading, setLoading] = useState(true);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [event, setEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    const fetchTutorial = async () => {
      setLoading(true);

      const client = getClient(sid!);

      const vars: TutorialDetailQueryVariables = {
        tutorMail: user.mail,
        eventID: id,
      };

      try {
        const tutorialsData = await client.request<TutorialDetailQuery>(
          TutorialDetailDocument,
          vars
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
        setEvent({ ...defaultEvent, ...tutorialsData.events[0] });
      } catch (err) {
        toast.error("Beim Laden der Tutoriendaten ist ein Fehler aufgetreten.");
        console.log(err);
      }

      setLoading(false);
    };

    void fetchTutorial();
  }, [id, sid, user]);

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
            <div key={t.ID} className="space-y-4">
              <RoomDetail room={t.room} className="flex flex-row space-x-4" />
              <StudentsTable columns={columns} data={t.students ?? []} />
              {i + 1 !== tutorials.length && <Separator />}
            </div>
          ))
        )}
      </section>
    </>
  );
}
