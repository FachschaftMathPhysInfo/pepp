import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import React, {useState} from "react";
import {Input} from "@/components/ui/input";
import {DataTablePagination} from "@/components/data-table-pagination";
import {toast} from "sonner";
import {Building, Room} from "@/lib/gql/generated/graphql";
import {RoomColumn} from "@/components/tables/rooms-table/room-columns";
import ConfirmationDialog from "@/components/confirmation-dialog";


interface DataTableProps {
  data: Room[];
  refreshData: () => void;
}

export function RoomTable({data, refreshData}: DataTableProps) {


  const [dialogState, setDialogState] = useState<{
    mode: "editRoom" | "deleteRoom" | "editBuilding" | "deleteBuilding" | null,
    building?: Building,
    room?: Room,
  }>({mode: null});
  const columns = RoomColumn({setDialogState});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
  });


  function closeDialog() {
    setDialogState({mode: null})
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Name filtern..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
                    <TableHead  className={'text-left'} key={header.id}>
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
                    <TableCell className={'[&:not(:first-child)]:ml-8'} key={cell.id}>
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
      <DataTablePagination table={table} />
      <ConfirmationDialog
        description={`Dies wird das Gebäude ${dialogState.building?.name} unwiederruflich löschen`}
        onConfirm={ async () =>{

          if(dialogState.building){
          }

          refreshData()
          toast.info(`${dialogState.building?.name} wurde erfolgreich gelöscht`)
        }}
        isOpen={dialogState.mode === "deleteBuilding"}
        closeDialog={closeDialog}
      />
      <ConfirmationDialog
        description={`Dies wird den Raum ${dialogState.room?.name} unwiederruflich löschen`}
        onConfirm={ async () =>{

          if(dialogState.building){
          }

          refreshData()
          toast.info(`${dialogState.room?.name} wurde erfolgreich gelöscht`)
        }}
        isOpen={dialogState.mode === "deleteBuilding"}
        closeDialog={closeDialog}
      />

    </div>
  );
}