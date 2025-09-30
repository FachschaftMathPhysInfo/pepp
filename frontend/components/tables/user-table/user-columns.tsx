import {DataTableColumnHeader} from "@/components/tables/data-table-column-header";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Role, User} from "@/lib/gql/generated/graphql";
import {ColumnDef} from "@tanstack/react-table";
import {MoreHorizontal, Shield,} from "lucide-react";
import React, {SetStateAction} from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {useUser} from "@/components/providers";
import {Badge} from "@/components/ui/badge";

interface UserColumnProps {
  setDialogState: React.Dispatch<
    SetStateAction<{
      mode: "makeAdmin" | "removeAdmin" | "deleteUser" | "deleteAdmin" | null;
      user?: { id: number, mail: string; fn: string; sn: string; newRole: Role };
    }>
  >;
}

export function UserColumns({setDialogState}: UserColumnProps): ColumnDef<User>[] {
  const { user } = useUser();

  return [
    {
      id: "role",
      cell: ({ row }) => (
        <>
          {row.original.role === Role.Admin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Shield />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Admin</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      ),
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
      cell: ({ row }) => row.original.fn,
    },
    {
      accessorKey: "mail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="E-Mail" />
      ),
      cell: ({ row }) => row.original.mail,
    },
    {
      id: "labels",
      cell: ({ row }) => (
        <div className={"flex flex-wrap items-center w-full gap-y-1 gap-x-4"}>
          {row.original.tutorials && (
            <Badge color={"#031e39"} className={'border-blue-500'}>Tutor:in</Badge>
          )}
          {row.original.confirmed && (
            <Badge color={'#022d16'} className={'border-green-500'}>Bestätigt</Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <>
            {/*Mail is a unique identifier.*/}
            {!(row.original.mail === user?.mail) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Menü öffnen</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {row.original.role === Role.Admin ? (
                    <DropdownMenuItem
                      onClick={() =>
                        setDialogState({
                          mode: "removeAdmin",
                          user: {
                            id: row.original.ID,
                            mail: row.original.mail,
                            fn: row.original.fn,
                            sn: row.original.sn,
                            newRole: Role.User,
                          },
                        })
                      }
                    >
                      Admin entfernen
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() =>
                        setDialogState({
                          mode: "makeAdmin",
                          user: {
                            id: row.original.ID,
                            mail: row.original.mail,
                            fn: row.original.fn,
                            sn: row.original.sn,
                            newRole: Role.Admin,
                          },
                        })
                      }
                    >
                      Admin machen
                    </DropdownMenuItem>
                  )}
                  {row.original.role === Role.User ? (
                    <DropdownMenuItem
                      onClick={() =>
                        setDialogState({
                          mode: "deleteUser",
                          user: {
                            id: row.original.ID,
                            mail: row.original.mail,
                            fn: row.original.fn,
                            sn: row.original.sn,
                            newRole: Role.Admin,
                          },
                        })
                      }
                    >
                      Löschen
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() =>
                        setDialogState({
                          mode: "deleteAdmin",
                          user: {
                            id: row.original.ID,
                            mail: row.original.mail,
                            fn: row.original.fn,
                            sn: row.original.sn,
                            newRole: Role.Admin,
                          },
                        })
                      }
                    >
                      Löschen
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        );
      },
    },
  ];
}
