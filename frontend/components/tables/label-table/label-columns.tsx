import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Label} from "@/lib/gql/generated/graphql";
import {ColumnDef} from "@tanstack/react-table";
import {Edit2, MoreHorizontal, Trash} from "lucide-react";
import React, {SetStateAction} from "react";
import {LabelDialogState} from "@/app/(settings)/admin/labels/page";
import {Badge} from "@/components/ui/badge";


interface LabelColumnProps {
  setDialogState: React.Dispatch<SetStateAction<LabelDialogState>>;
}

export function LabelColumn({setDialogState}: LabelColumnProps): ColumnDef<Label>[] {

  return [
    {
      accessorKey: "name",
      header: "",
      cell: ({row}) => {
        return (
          <Badge color={row.original.color ?? undefined}>
            {row.original.name}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => {
        return (
          <span className={'w-full flex justify-end'}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menü öffnen</span>
                  <MoreHorizontal className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setDialogState({
                    mode: "edit",
                    currentLabel: row.original,
                  })}
                >
                  <Edit2/>
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDialogState({
                      mode: "delete",
                      currentLabel: row.original
                    })
                  }}
                  className={'text-destructive'}
                >
                  <Trash className={'stroke-destructive'} />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        );
      },
    },
  ];
}