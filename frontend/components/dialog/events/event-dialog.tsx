"use client";

import Markdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event, Role } from "@/lib/gql/generated/graphql";
import { Calendar, Clock, Edit2, Sprout } from "lucide-react";
import { EventForm } from "@/components/dialog/events/event-form";
import { Badge } from "@/components/ui/badge";
import { formatDateToDDMM, formatDateToHHMM } from "@/lib/utils";
import { TutorialsTable } from "../../tables/tutorials-table/tutorials-table";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {useUser} from "@/components/provider/user-provider";

interface EventDialogProps {
  event: Event | null;
  isOpen: boolean;
  onCloseAction: () => void;
}

export function EventDialog({
  event,
  isOpen,
  onCloseAction,
}: EventDialogProps) {
  const { user } = useUser();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <VisuallyHidden>
        <DialogTitle>Event Dialog für ${event?.title}</DialogTitle>
      </VisuallyHidden>
      <DialogContent
        className={"sm:!min-w-[800px] [&>button:last-child]:hidden"}
      >
        {user?.role === Role.Admin ? (
          <>
            <DialogHeader>
              <DialogTitle className={"flex justify-between items-center"}>
                <span className={"flex items-center"}>
                  {event ? (
                    <>
                      <Edit2 size={18} className={"inline mr-2"} /> Event
                      bearbeiten
                    </>
                  ) : (
                    <>
                      <Sprout className={"inline mr-1"} /> Event erstellen
                    </>
                  )}
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                {event
                  ? "Bearbeite das Event hier"
                  : "Erstelle ein neues Event für dieses Programm"}
              </DialogDescription>
            </DialogHeader>
            <EventForm
              event={event}
              edit={!!event}
              onCloseAction={onCloseAction}
            />
          </>
        ) : (
          event && (
            <>
              <DialogHeader>
                <DialogTitle>{event.title}</DialogTitle>
                <DialogDescription className={"flex flex-col gap-y-2"}>
                  <Markdown>{event.description}</Markdown>
                  <span className={"flex items-center gap-2"}>
                    <Calendar size={18} />{" "}
                    {formatDateToDDMM(new Date(event.from))}
                  </span>
                  <span className={"flex items-center gap-2"}>
                    <Clock size={18} />
                    {formatDateToHHMM(new Date(event.from))} Uhr -{" "}
                    {formatDateToHHMM(new Date(event.to))} Uhr
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className={"flex items-center gap-2 flex-wrap"}>
                <Badge color={event.topic.color}>{event.topic.name}</Badge>

                <Badge color={event.type.color}>{event.type.name}</Badge>
              </div>

              <TutorialsTable event={event} />
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
