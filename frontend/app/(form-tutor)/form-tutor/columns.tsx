import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Event } from "@/lib/gql/generated/graphql";
import { formatDateToDDMM, formatDateToHHMM } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Event>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Alle auswählen"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value)
        }}
        aria-label="Reihe auswählen"
      />
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titel" />
    ),
    cell: ({ row }) => row.original.title,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Datum" />
    ),
    cell: ({ row }) => {
      return formatDateToDDMM(new Date(row.original.from));
    },
  },
  {
    accessorKey: "from",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Von" />
    ),
    cell: ({ row }) => {
      return formatDateToHHMM(new Date(row.original.from));
    },
  },
  {
    accessorKey: "to",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bis" />
    ),
    cell: ({ row }) => {
      return formatDateToHHMM(new Date(row.original.to));
    },
  },
  {
    accessorKey: "type",
    header: "Art",
    cell: ({ row }) => (
      <Badge variant="event" color={row.original.type.color ?? ""}>
        {row.original.type.name}
      </Badge>
    ),
  },
  {
    accessorKey: "topic",
    header: "Thema",
    cell: ({ row }) => (
      <Badge variant="event" color={row.original.topic.color ?? ""}>
        {row.original.topic.name}
      </Badge>
    ),
  },
];
