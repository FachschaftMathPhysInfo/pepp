import { Event } from "@/lib/gql/generated/graphql";
import { Calendar, Pencil, Trash } from "lucide-react";
import React from "react";
import { EventsDialogState } from "./page";
import { formatDateToDDMM } from "@/lib/utils";
import PlannerItem from "@/components/planner-item";
import EventItem from "@/app/(settings)/admin/events/umbrella-item";

interface UmbrellaEventSectionProps {
  umbrella: Event;
  events: Event[];
  setDialogState: React.Dispatch<React.SetStateAction<EventsDialogState>>;
  setEventDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCloseupID: React.Dispatch<React.SetStateAction<number>>;
}

export default function UmbrellaEventSection({
                                               umbrella,
                                               events,
                                               setDialogState,

                                             }: UmbrellaEventSectionProps) {
  const readableFrom = formatDateToDDMM(new Date(umbrella.from));
  const readableTo = formatDateToDDMM(new Date(umbrella.to));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start sm:items-center w-full max-w-full">
        <span className="flex max-sm:items-start justify-between items-center flex-grow max-sm:flex-col">
          <h2 className="text-2xl font-bold mr-5">{umbrella.title}</h2>
          <span className="text-muted-foreground flex items-center mr-5">
            <Calendar className="inline mr-1 w-4" />
            {readableFrom} bis {readableTo}
          </span>
        </span>
      </div>

      <ul className="space-y-2 pl-4">
        {events.map((event) => (
          <EventItem
            event={event}
            onEdit={() => setDialogState({ mode: "editEvent", umbrella })}
            onDelete={() => setDialogState({ mode: "deleteEvent", umbrella })}
          />
        ))}
      </ul>
    </div>
  );
}
