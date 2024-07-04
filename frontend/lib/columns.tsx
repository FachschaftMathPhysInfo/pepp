import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "isSelected",
    header: "",
    cell: ({ row }) => (
      <div className="w-full flex flex-row justify-center">
        <Checkbox
          className={"mx-auto"}
          checked={row.getIsSelected()}
          onCheckedChange={
            (value) => row.toggleSelected(!!value)
          }
          aria-label="Ich kann diese Vorlesung halten"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Veranstaltung",
  },
  {
    accessorKey: "date",
    header: "Datum",
  },
  {
    accessorKey: "time",
    header: "Uhrzeit",
  },
];
