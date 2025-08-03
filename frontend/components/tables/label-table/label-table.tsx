import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {Table, TableBody, TableCell, TableRow,} from "@/components/ui/table";
import React from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/lib/gql/generated/graphql";
import {DataTablePagination} from "@/components/tables/data-table-pagination";
import {LabelColumn} from "@/components/tables/label-table/label-columns";
import {LabelDialogState} from "@/app/(settings)/admin/labels/page";

interface DataTableProps {
  data: Label[];
  setDialogState: React.Dispatch<React.SetStateAction<LabelDialogState>>;
}

export function LabelTable({
                             data,
                             setDialogState,
                           }: DataTableProps) {
  const columns = LabelColumn({setDialogState})
  const [sorting, setSorting] = React.useState<SortingState>([]);
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
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center">
          <Input
            placeholder="Name suchen..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={"[&:not(:first-child)]:pl-8"}
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
                    Es wurden noch keine Labels erstellt
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} enableSelectionCounter={false}/>
      </div>
    </>
  );
}
