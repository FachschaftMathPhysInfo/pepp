import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Event = {
  id: string;
  title: string;
  from: Date;
  to: Date;
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "isSelected",
    header: "",
    cell: ({ row }) => (
      <div className="w-full flex flex-row justify-center">
        <Checkbox
          className={"mx-auto"}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Ich kann diese Vorlesung halten"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Veranstaltung",
  },
  {
    accessorKey: "from",
    header: "Von",
  },
  {
    accessorKey: "to",
    header: "Bis",
  },
];
