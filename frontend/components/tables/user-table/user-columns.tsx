import {DataTableColumnHeader} from "@/components/data-table-column-header";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Role, User} from "@/lib/gql/generated/graphql";
import {ColumnDef} from "@tanstack/react-table";
import {BadgeCheck, BadgeX, Check, MoreHorizontal, Shield, X} from "lucide-react";
import React, {SetStateAction} from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";


interface UserColumnProps {
  setDialogState: React.Dispatch<SetStateAction<{
    mode: "makeAdmin" | "removeAdmin" | "deleteUser" | null,
    user?: {mail: string, fn: string, sn: string, newRole: Role}
  }>>;
}

export function UserColumns({setDialogState} : UserColumnProps): ColumnDef<User>[] {

  return [
    {
      accessorKey: "role",
      header: "",
      cell: ({row}) => (
        <>
          {row.original.role === Role.Admin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Shield/>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Admin</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      )
    },
    {
      accessorKey: "sn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nachname" />
      ),
      cell: ({ row }) => row.original.sn,
    },
    {
      accessorKey: "fn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vorname" />
      ),
      cell: ({ row }) => row.original.fn
    },
    {
      accessorKey: "mail",
      header: ({column}) => (
        <DataTableColumnHeader column={column} title="E-Mail"/>
      ),
      cell: ({row}) => row.original.mail
    },
    {
      accessorKey: "confirmed",
      header: "Registriert",
      cell: ({ row }) => (
        <>
          {row.original.confirmed ? (
            <BadgeCheck/>
          ) : (
            <BadgeX/>
          )
          }
        </>
      ),
    },
    {
      accessorKey: "tutorials",
      header: "Tutor*in",
      cell: ({ row }) => (
        <>
          {(row.original.tutorials && row.original.tutorials.length > 0) ? (
            <Check/>
          ) : (
            <X/>
          )}
        </>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menü öffnen</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {row.original.role === Role.Admin ? (
                  <DropdownMenuItem onClick={() => setDialogState({
                    mode: "removeAdmin",
                    user: {
                      mail: row.original.mail,
                      fn: row.original.fn,
                      sn: row.original.sn,
                      newRole: Role.User
                    }
                  })}>Admin entfernen</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setDialogState({
                    mode: "makeAdmin",
                    user: {
                      mail: row.original.mail,
                      fn: row.original.fn,
                      sn: row.original.sn,
                      newRole: Role.Admin
                    }
                  })}>Admin machen</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setDialogState({
                  mode: "deleteUser",
                  user: {
                    mail: row.original.mail,
                    fn: row.original.fn,
                    sn: row.original.sn,
                    newRole: Role.Admin
                  }
                })}>Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
}
