"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Vorlesung = {
    isSelected: boolean,
    name: string
    date: string
}

export const columns: ColumnDef<Vorlesung>[] = [
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
        header: "Name der Veranstaltung",
    },
    {
        accessorKey: "date",
        header: "Datum",
    },
]
