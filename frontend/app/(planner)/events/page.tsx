"use client";

import { useUmbrella } from "@/components/providers";
import { DataTable } from "./data-table";
import {
  Event,
  TableEventsDocument,
  TableEventsQuery,
  TableEventsQueryVariables,
} from "@/lib/gql/generated/graphql";
import { client } from "@/lib/graphql";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  const { umbrellaID } = useUmbrella();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const vars: TableEventsQueryVariables = {
        umbrellaID: [umbrellaID ?? 0],
      };

      const eventData = await client.request<TableEventsQuery>(
        TableEventsDocument,
        vars
      );

      if (eventData.events.length) {
        setEvents(eventData.events);
      }

      setLoading(false);
    };

    fetchData();
  }, [umbrellaID]);

  return (
    <>
      <section className="space-y-4">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <DataTable columns={columns} data={events} />
          </>
        )}
      </section>
    </>
  );
}
