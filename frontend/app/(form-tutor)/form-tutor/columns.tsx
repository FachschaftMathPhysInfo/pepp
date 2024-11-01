"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { eventBroker } from "@/lib/eventBroker";
import { Badge } from "@/components/ui/badge";
import {Event} from "@/lib/gql/generated/graphql";

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "isSelected",
    header: "",
    cell: ({ row }) => (
      <Checkbox
        className={"mx-auto"}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value);

          if (row.getIsSelected()) {
            eventBroker.removeEvent(row.original.ID);
          } else {
            eventBroker.addEvent(row.original.ID);
          }
        }}
        aria-label="Ich kann diese Vorlesung halten"
      />
    ),
  },
  {
    accessorKey: "title",
    header: () => <div className="text-left">Veranstaltung</div>,
    cell: ({ row }) => (
      <div>
        <div className={"mb-0.5"}>{row.original.title}</div>
        <Badge color={row.original.type.color}>{row.original.type.name}</Badge>
      </div>
    ),
  },
  {
    accessorKey: "from",
    header: () => <div className="text-left">Datum</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("from"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "from",
    header: () => <div className="text-left">Von</div>,
    cell: ({ row }) => {
      const time = new Date(row.getValue("from"));
      return time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "to",
    header: () => <div className="text-left">Bis</div>,
    cell: ({ row }) => {
      const time = new Date(row.getValue("to"));
      return time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];
