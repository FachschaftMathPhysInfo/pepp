import { DataTableColumnHeader } from "@/components/tables/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DeleteEventDocument,
  DeleteEventMutation,
  Event,
} from "@/lib/gql/generated/graphql";
import { formatDateToDDMM, formatDateToHHMM } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { useState } from "react";
import { useRefetch, useUser } from "@/components/providers";
import { getClient } from "@/lib/graphql";
import { toast } from "sonner";
import { EventDialog } from "@/components/dialog/events/event-dialog";

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titel" />
    ),
    cell: ({ row }) => row.original.title,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Datum" />
    ),
    cell: ({ row }) => {
      return formatDateToDDMM(new Date(row.original.from));
    },
  },
  {
    accessorKey: "from",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Von" />
    ),
    cell: ({ row }) => {
      return formatDateToHHMM(new Date(row.original.from));
    },
  },
  {
    accessorKey: "to",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bis" />
    ),
    cell: ({ row }) => {
      return formatDateToHHMM(new Date(row.original.to));
    },
  },
  {
    accessorKey: "type",
    header: "Art",
    cell: ({ row }) => (
      <Badge variant="event" color={row.original.type.color ?? ""}>
        {row.original.type.name}
      </Badge>
    ),
  },
  {
    accessorKey: "topic",
    header: "Themen",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.topics.map((t) => (
          <Badge key={t.ID} className="mr-1" variant="event" color={t.color}>
            {t.name}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const [dialogOpen, setDialogOpen] = useState<"delete" | "edit" | null>(
        null
      );
      const { sid } = useUser();
      const { triggerRefetch } = useRefetch();

      const handleDelete = async (id: number) => {
        const client = getClient(String(sid));

        try {
          await client.request<DeleteEventMutation>(DeleteEventDocument, {
            eventIds: [id],
          });
          triggerRefetch();
          toast.success("Event wurde erfolgreich gelöscht");
        } catch {
          toast.error("Ein Fehler ist aufgetreten");
        }
      };

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
              <DropdownMenuLabel>Optionen</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setDialogOpen("edit")}>
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDialogOpen("delete")}>
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmationDialog
            isOpen={dialogOpen === "delete"}
            mode={"confirmation"}
            description={`Dies wird das Event ${row.original.title} unwiderruflich löschen`}
            onConfirm={() => handleDelete(row.original.ID)}
            closeDialog={() => setDialogOpen(null)}
          />

          <EventDialog
            event={row.original}
            isOpen={dialogOpen === "edit"}
            onCloseAction={() => setDialogOpen(null)}
          />
        </>
      );
    },
  },
];
