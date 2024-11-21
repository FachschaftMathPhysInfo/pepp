"use client";

import {
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  EventToUserAssignment,
  NewEvent,
  UpdateEventMutationVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { ChevronsUpDown, Edit3, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Dialog,
  DialogAction,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SignInDialog } from "@/components/sign-in-dialog";
import { useUmbrella, useUser } from "../providers";
import { client } from "@/lib/graphql";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatDateToHHMM } from "@/lib/utils";
import { TutorialsTable } from "./tutorials-table";
import { Input } from "../ui/input";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Titel darf nicht leer sein.",
  }),
  date: z.date({
    required_error: "Bitte Veranstaltungsdatum angeben.",
  }),
  description: z.string(),
});

export default function EventDialog() {
  const { user } = useUser();
  const { closeupID, setCloseupID } = useUmbrella();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [event, setEvent] = useState<EventCloseupQuery["events"][0] | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [newAssignments, setNewAssignments] = useState<EventToUserAssignment[]>(
    []
  );
  const [deleteAssignments, setDeleteAssignments] = useState<
    EventToUserAssignment[]
  >([]);
  const [newEvent, setNewEvent] = useState<NewEvent>();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: event?.title,
      description: event?.description!,
      date: event?.from,
    },
  });

  const updateEvent = async (data: z.infer<typeof FormSchema>) => {
    setUpdateLoading(true);

    const vars: UpdateEventMutationVariables = {
      id: event?.ID ?? 0,
      event: {
        title: data.title,
        needsTutors: true,
        from: "",
        to: "",
      },
    };
  };

  useEffect(() => {
    if (!closeupID) return;
    const fetchData = async () => {
      setLoading(true);

      const vars: EventCloseupQueryVariables = {
        id: closeupID,
      };

      const eventData = await client.request<EventCloseupQuery>(
        EventCloseupDocument,
        vars
      );

      if (eventData.events.length) {
        setEvent(eventData.events[0]);
        form.reset();
        setLoading(false);
      }
    };

    setOpen(true);
    fetchData();
  }, [closeupID]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setCloseupID(null);
          setEdit(false);
        }
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(updateEvent)}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogAction>
              {edit ? (
                <>
                  <Save className="h-4 w-4" onClick={() => setEdit(false)} />
                  <span className="sr-only">Speichern</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" onClick={() => setEdit(true)} />
                  <span className="sr-only">Bearbeiten</span>
                </>
              )}
            </DialogAction>
            {loading ? (
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-3 w-[200px]" />
                <Skeleton className="h-[125px] w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextareaAutosize
                              placeholder="Veranstaltungstitel"
                              defaultValue={event?.title}
                              disabled={!edit}
                              className="disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-solid border-b-2 disabled:border-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextareaAutosize
                              placeholder="Beschreibung der Veranstaltung"
                              defaultValue={event?.description ?? ""}
                              disabled={!edit}
                              className="disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-solid border-b-2 disabled:border-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-x-2">
                      <Badge variant="event" color={event?.topic.color}>
                        {event?.topic.name}
                      </Badge>
                      <Badge variant="event" color={event?.type.color}>
                        {event?.type.name}
                      </Badge>
                    </div>
                    {edit ? (
                      <DatePicker
                        from={new Date(event?.from)}
                        to={new Date(event?.to)}
                      />
                    ) : (
                      <FullDateDescription
                        from={new Date(event?.from)}
                        to={new Date(event?.to)}
                      />
                    )}
                  </DialogDescription>
                </DialogHeader>

                {!user && (
                  <div>
                    <span>Bitte </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <span className="cursor-pointer text-blue-500 hover:underline">
                          anmelden
                        </span>
                      </DialogTrigger>
                      <SignInDialog />
                    </Dialog>
                    <span>, um dich eintragen zu können.</span>
                  </div>
                )}
                <TutorialsTable
                  tutorials={event?.tutorsAssigned ?? []}
                  registrationCounts={
                    event?.tutorsAssigned?.map((t) => t.registrations ?? 0) ||
                    []
                  }
                  capacities={event?.tutorsAssigned?.map(t => t.room.capacity ?? 1) || []}
                  edit={edit}
                  setNewAssignments={setNewAssignments}
                  setDeleteAssignments={setDeleteAssignments}
                />
              </div>
            )}
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}

interface DatePickerProps {
  from: Date;
  to: Date;
}

function DatePicker({ from, to }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(from);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-fit h-fit text-start space-x-2")}
        >
          <FullDateDescription from={from} to={to} />
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex flex-row">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => date < new Date()}
        />
        <div className="p-2 space-y-4">
          <div className="space-y-2">
            Von
            <Input aria-label="Time" type="time" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface FullDateDescriptionProps {
  from: Date;
  to: Date;
}

function FullDateDescription({ from, to }: FullDateDescriptionProps) {
  return (
    <div>
      <p>
        {from.toLocaleString(undefined, { weekday: "long" })},{" "}
        {format(from, "PPP")}
      </p>
      <p>
        Von {formatDateToHHMM(from)} bis {formatDateToHHMM(to)}
      </p>
    </div>
  );
}
