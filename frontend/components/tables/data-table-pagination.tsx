import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  enableSelectionCounter?: boolean;
}

export function DataTablePagination<TData>({
                                             table,
                                             enableSelectionCounter = true,
                                           }: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div className="flex items-center justify-between w-full">
      {enableSelectionCounter && (
        <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
          {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} ausgewählt
        </div>
      )}

      <div className="w-full flex justify-between items-center">
        <div className="hidden sm:flex items-center space-x-2 text-sm">
          <span>Einträge pro Seite</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={val => table.setPageSize(+val)}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map(size => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Select onValueChange={val => table.setPageIndex(parseInt(val))}>
            <SelectTrigger className="w-[50px] mr-2">
              <SelectValue placeholder={pageIndex + 1} />
            </SelectTrigger>
            <SelectContent>
              {Array.from(Array(pageCount).keys()).map((_, i) => (
                <SelectItem key={i} value={String(i)}>{i+1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          von {pageCount}

          <span className="hidden sm:inline">
            Seite {pageIndex + 1} von {pageCount}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden lg:flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
