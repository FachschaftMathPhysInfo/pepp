import {
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable, getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DeleteUserDocument,
  DeleteUserMutation,
  Role, UpdateUser,
  UpdateUserDocument,
  UpdateUserMutation,
  User,
} from "@/lib/gql/generated/graphql";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { UserColumns } from "@/components/tables/users/user-columns";
import { GraphQLClient } from "graphql-request";
import { getClient } from "@/lib/graphql";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "sonner";
import {useUser} from "@/components/provider/user-provider";

interface DataTableProps {
  data: User[];
  refreshData: () => void;
}

export function UserTable({ data, refreshData }: DataTableProps) {
  const { sid } = useUser();
  const [client, setClient] = useState<GraphQLClient>(getClient());

  const handleDeleteUser = async (id: number): Promise<void> => {
    await client.request<DeleteUserMutation>(DeleteUserDocument, {
      id: [id],
    });
  };

  const handleRoleChange = async (
    id: number,
    mail: string,
    fn: string,
    sn: string,
    newRole: Role
  ): Promise<void> => {
    const changedUser: UpdateUser = {
      mail: mail,
      fn: fn,
      sn: sn,
      role: newRole
    }

    await client.request<UpdateUserMutation>(UpdateUserDocument, {
      user: changedUser,
      id: id
    });
  };

  const [dialogState, setDialogState] = useState<{
    mode: "makeAdmin" | "removeAdmin" | "deleteUser" | "deleteAdmin" | null;
    user?: { id: number, mail: string; fn: string; sn: string; newRole: Role };
  }>({ mode: null });
  const columns = UserColumns({ setDialogState });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
  });

  useEffect(() => {
    setClient(getClient(String(sid)));
  }, [sid]);

  function closeDialog() {
    setDialogState({ mode: null });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Nachnamen filtern..."
          value={(table.getColumn("sn")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("sn")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className={"text-left"} key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={"[&:not(:first-child)]:ml-8"}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Keine Ergebnisse.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} enableSelectionCounter={false} />

      <ConfirmationDialog
        mode="confirmation"
        description={`Dies wird ${dialogState.user?.fn} ${dialogState.user?.sn} zum Admin machen`}
        onConfirm={async () => {
          if (dialogState.user) {
            await handleRoleChange(
              dialogState.user.id,
              dialogState.user.mail,
              dialogState.user.fn,
              dialogState.user.sn,
              dialogState.user.newRole
            );
          }
          refreshData();
          toast.success(
            `${dialogState.user?.fn} ${dialogState.user?.sn} wurde erfolgreich zum Admin gemacht`
          );
        }}
        isOpen={dialogState.mode === "makeAdmin"}
        closeDialog={closeDialog}
      />
      <ConfirmationDialog
        mode="confirmation"
        description={`Dies wird ${dialogState.user?.fn} ${dialogState.user?.sn} zum normalen User machen`}
        onConfirm={async () => {
          if (dialogState.user) {
            await handleRoleChange(
              dialogState.user.id,
              dialogState.user.mail,
              dialogState.user.fn,
              dialogState.user.sn,
              dialogState.user.newRole
            );
          }
          refreshData();
          toast.success(
            `${dialogState.user?.fn} ${dialogState.user?.sn} wurde erfolgreich zu User gemacht`
          );
        }}
        isOpen={dialogState.mode === "removeAdmin"}
        closeDialog={closeDialog}
      />
      <ConfirmationDialog
        mode="confirmation"
        description={`Dies wird ${dialogState.user?.fn} ${dialogState.user?.sn} unwiederruflich löschen`}
        onConfirm={async () => {
          if (dialogState.user) {
            await handleDeleteUser(dialogState.user.id);
          }

          refreshData();
          toast.success(
            `${dialogState.user?.fn} ${dialogState.user?.sn} wurde erfolgreich entfernt`
          );
        }}
        isOpen={dialogState.mode === "deleteUser"}
        closeDialog={closeDialog}
      />
      <ConfirmationDialog
        mode="information"
        information={`Admins können nicht gelöscht werden!`}
        description={`Zum Löschen von Admins müssen diese erst zu normalen Usern heruntergestuft werden.`}
        isOpen={dialogState.mode === "deleteAdmin"}
        closeDialog={closeDialog}
      />
    </div>
  );
}
