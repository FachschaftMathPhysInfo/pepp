import { Event } from "@/lib/gql/generated/graphql";
import {Calendar, Clock, Pencil, Trash} from "lucide-react";
import React from "react";
import { formatDateToDDMM , formatDateToHHMM} from "@/lib/utils";

interface EventItemProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
}



export default function EventItem({ event, onEdit, onDelete }: EventItemProps) {
  const timeDate = formatDateToDDMM(new Date(event.from));
  const timeFrom = formatDateToHHMM(new Date(event.from));
  const timeTo = formatDateToHHMM(new Date(event.to));

  return (
    <div className="flex justify-between items-center w-full max-w-full p-2">
      <span className="flex flex-col max-sm:flex-row max-sm:justify-between flex-grow mr-4">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <span className="text-muted-foreground flex items-center max-sm:ml-4">
          <Calendar className="inline mr-1 w-4" />
          {timeDate}
        </span>

        <span className="text-muted-foreground flex items-center max-sm:ml-4">
        <Clock className="inline mr-1 w-4" />
        {timeFrom} - {timeTo}
        </span>
      </span>

      <span className="flex items-center space-x-4">
        <button onClick={onEdit} aria-label={`Edit ${event.title}`} className="hover:text-blue-600">
          <Pencil className="w-5" />
        </button>
        <button onClick={onDelete} aria-label={`Delete ${event.title}`} className="hover:text-red-600">
          <Trash className="w-5 stroke-red-500" />
        </button>
      </span>
    </div>
  );
}
