import { DataTableColumnHeader } from "@/components/tables/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/lib/gql/generated/graphql";
import { ColumnDef } from "@tanstack/react-table";
import { SquareMinus } from "lucide-react";
import React from "react";
import { StudentTableDialogState } from "@/app/(settings)/profile/tutorials/[tutorial]/tutorial-page";

export default function StudentsColumns(
  setDialog: React.Dispatch<React.SetStateAction<StudentTableDialogState>>
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.original.fn + " " + row.original.sn,
    },
    {
      accessorKey: "mail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="E-Mail" />
      ),
      cell: ({ row }) => {
        return row.original.mail;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: (cell) => {
        return (
          <div className={"w-full flex justify-end items-center"}>
            <Button
              variant={"ghost"}
              className={"text-red-600"}
              onClick={() =>
                setDialog({
                  currentUser: cell.row.original,
                  isOpen: true,
                })
              }
            >
              Aus Tutorium entfernen
              <SquareMinus className={"stroke-red-600"} />
            </Button>
          </div>
        );
      },
    },
  ];
}
