"use client";

import { useUser } from "@/components/providers";
import { TableSkeleton } from "@/components/table-skeleton";
import {
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
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface TutorialPageProps {
  id: number;
}

export function TutorialPage({ id }: TutorialPageProps) {
  const { sid, user } = useUser();

  const [loading, setLoading] = useState(true);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    const fetchTutorial = async () => {
      setLoading(true);

      const client = getClient(sid!);

      const vars: TutorialDetailQueryVariables = {
        tutorMail: user?.mail!,
        eventID: id,
      };

      const tutorialsData = await client.request<TutorialDetailQuery>(
        TutorialDetailDocument,
        vars
      );

      if (tutorialsData.tutorials.length) {
        setTutorials(
          tutorialsData.tutorials.map((t) => ({
            ...defaultTutorial,
            ...t,
            event: { ...defaultEvent, ...t.event },
            room: {
              ...defaultRoom,
              ...t.room,
              building: { ...defaultBuilding, ...t.room.building },
            },
            students: t.students?.map((s) => ({ ...defaultUser, ...s })),
          }))
        );
      }

      setLoading(false);
    };

    fetchTutorial();
  }, [id]);

  return (
    <>
      <section className="space-y-4">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <DataTable columns={columns} data={tutorials[0].students ?? []} />
          </>
        )}
      </section>
    </>
  );
}
