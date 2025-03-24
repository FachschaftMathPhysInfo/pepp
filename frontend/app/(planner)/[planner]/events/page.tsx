"use client";

import { DataTable } from "./data-table";
import {
  Event,
  TableEventsDocument,
  TableEventsQuery,
  TableEventsQueryVariables,
} from "@/lib/gql/generated/graphql";
import { getClient } from "@/lib/graphql";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { TableSkeleton } from "@/components/table-skeleton";
import {Button} from "@/components/ui/button";
import {usePathname} from "next/navigation";
import {PlusCircle} from "lucide-react";
import {extractId} from "@/lib/utils";

export default function EventsPage() {
  const pathname = usePathname()
  const umbrellaID = extractId(pathname)
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const client = getClient()

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
            <Button className="w-auto">
              <PlusCircle />
              Event hinzufügen
            </Button>
            <DataTable columns={columns} data={events} />
          </>
        )}
      </section>
    </>
  );
}
