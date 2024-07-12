"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TutorFormEventsQuery } from "@/lib/gql/generated/graphql";
import { manageEvents } from "@/app/actions";

export const columns: ColumnDef<TutorFormEventsQuery['events'][0]>[] = [
  {
    accessorKey: "isSelected",
    header: "",
    cell: ({ row }) => (
      <div className="w-full flex flex-row justify-center">
        <Checkbox
          className={"mx-auto"}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
            manageEvents(!row.getIsSelected(), row.original.ID)
          }}
          aria-label="Ich kann diese Vorlesung halten"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: () => <div className="text-left">Veranstaltung</div>,
  },
  {
    accessorKey: "from",
    header: () => <div className="text-left">Datum</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue('from'));
      return date.toLocaleDateString();
    }
  },
  {
    accessorKey: "from",
    header: () => <div className="text-left">Von</div>,
    cell: ({ row }) => {
      const time = new Date(row.getValue('from'));
      return time.toLocaleTimeString();
    }
  },
  {
    accessorKey: "to",
    header: () => <div className="text-left">Bis</div>,
    cell: ({ row }) => {
      const time = new Date(row.getValue('to'));
      return time.toLocaleTimeString();
    }
  },
];
