import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Role,
  User
} from "@/lib/gql/generated/graphql";
import { ColumnDef } from "@tanstack/react-table";
import {BadgeCheck, BadgeX, Check, MoreHorizontal, X} from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import React, {useEffect} from "react";


interface UserColumnProps {
  handleDeleteUser: (mail: string) => Promise<void>,
  handleRoleChange: (mail: string, fn: string, sn: string, newRole: Role) => Promise<void>
  refreshData: () => void,
}

export function UserColumns( {handleDeleteUser, handleRoleChange, refreshData} : UserColumnProps): ColumnDef<User>[] {
  const [makeAdminDialogIsOpen,  setMakeAdminDialogIsOpen] = React.useState<boolean>( false );
  const [removeAdminDialogIsOpen, setRemoveAdminDialogIsOpen] = React.useState<boolean>( false );
  const [deleteUserDialogIsOpen, setDeleteUserDialogIsOpen] = React.useState<boolean>( false );

  useEffect(() => {
    if(makeAdminDialogIsOpen) {
      setRemoveAdminDialogIsOpen(false)
      setDeleteUserDialogIsOpen(false)
    } else if (removeAdminDialogIsOpen) {
      setMakeAdminDialogIsOpen(false)
      setDeleteUserDialogIsOpen(false)
    } else if (deleteUserDialogIsOpen){
      setMakeAdminDialogIsOpen(false)
      setRemoveAdminDialogIsOpen(false)
    }
  }, [makeAdminDialogIsOpen, removeAdminDialogIsOpen, deleteUserDialogIsOpen]);


  return [
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
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rolle" />
      ),
      cell: ({ row }) => row.original.role
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
                  <DropdownMenuItem onClick={() => setRemoveAdminDialogIsOpen(!removeAdminDialogIsOpen)}>Admin entfernen</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setMakeAdminDialogIsOpen(!makeAdminDialogIsOpen)}>Admin machen</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setDeleteUserDialogIsOpen(!deleteUserDialogIsOpen)}>Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmationDialog
              description={'Dies wird ' + row.original.fn + ' ' + row.original.sn + ' zum Admin machen'}
              onConfirm={ async () => {
                await handleRoleChange(row.original.mail, row.original.fn, row.original.sn, Role.Admin)
                refreshData()
              }}
              isOpen={makeAdminDialogIsOpen}
              setIsOpen={setMakeAdminDialogIsOpen}
            />
            <ConfirmationDialog
              description={'Dies wird ' + row.original.fn + ' ' + row.original.sn + ' zum normalen User machen'}
              onConfirm={ async () =>{
                await handleRoleChange(row.original.mail, row.original.fn, row.original.sn, Role.User)
                refreshData()
              }}
              isOpen={removeAdminDialogIsOpen}
              setIsOpen={setRemoveAdminDialogIsOpen}
            />
            <ConfirmationDialog
              description={'Dies wird ' + row.original.fn + ' ' + row.original.sn + ' unwiederruflich löschen'}
              onConfirm={ async () => {
                await handleDeleteUser(row.original.mail)
                refreshData()
              }}
              isOpen={deleteUserDialogIsOpen}
              setIsOpen={setDeleteUserDialogIsOpen}
            />
          </>
        );
      },
    },
  ];
}
