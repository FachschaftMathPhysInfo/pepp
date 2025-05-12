import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
}

export function UserColumns( {handleDeleteUser, handleRoleChange} : UserColumnProps): ColumnDef<User>[] {
  const [makeAdminDialogOpen,  setMakeAdminDialogOpen] = React.useState<boolean>( false );
  const [removeAdminDialogOpen, setRemoveAdminDialogOpen] = React.useState<boolean>( false );
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = React.useState<boolean>( false );

  // With this only one dialog can be open at the same time
  useEffect(() => {
    if(makeAdminDialogOpen) {
      setRemoveAdminDialogOpen(false);
      setChangeRoleDialogOpen(false);
    } else if (removeAdminDialogOpen) {
      setMakeAdminDialogOpen(false);
      setChangeRoleDialogOpen(false);
    } else {
      setMakeAdminDialogOpen(false);
      setRemoveAdminDialogOpen(false);
    }
  }, [makeAdminDialogOpen, removeAdminDialogOpen, changeRoleDialogOpen]);


  return [
    {
      id: "select",
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Reihe auswählen"
        />
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
                  <DropdownMenuItem onClick={() => setRemoveAdminDialogOpen(!removeAdminDialogOpen)}>Admin entfernen</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setMakeAdminDialogOpen(!makeAdminDialogOpen)}>Admin machen</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setChangeRoleDialogOpen(!changeRoleDialogOpen)}>Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmationDialog description={'Dies wird ' + row.original.fn + ' ' + row.original.sn + ' zum Admin machen'} onConfirm={ () =>handleRoleChange(row.original.mail, row.original.fn, row.original.sn, Role.Admin)} isOpen={makeAdminDialogOpen} />
            <ConfirmationDialog description={'Dies wird ' + row.original.fn + ' ' + row.original.sn + ' zum normalen User machen'} onConfirm={ () =>handleRoleChange(row.original.mail, row.original.fn, row.original.sn, Role.User)} isOpen={removeAdminDialogOpen} />
            <ConfirmationDialog description={'Dies wird ' + row.original.fn + ' ' + row.original.sn + ' unwiederruflich löschen'} onConfirm={ () =>handleDeleteUser(row.original.mail)} isOpen={makeAdminDialogOpen} />
          </>
        );
      },
    },
  ];
}
