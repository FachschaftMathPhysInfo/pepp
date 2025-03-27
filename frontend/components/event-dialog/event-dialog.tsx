"use client";

import {
  Event,
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  EventToUserAssignment,
  Label,
  LabelKind,
  LabelsDocument,
  LabelsQuery,
  LabelsQueryVariables,
  Role,
  UpdateEventMutationVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronsUpDown, Edit3, Save } from "lucide-react";

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
import { useUser } from "../providers";
import { getClient } from "@/lib/graphql";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TutorialsTable } from "./tutorials-table";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { FullDateDescription } from "../full-date-description";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Titel darf nicht leer sein.",
  }),
  date: z.date({
    required_error: "Bitte Veranstaltungsdatum angeben.",
  }),
  description: z.string(),
});

interface EventDialogProps {
  id?: number;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modify?: boolean;
}

export default function EventDialog({
  id,
  open,
  setOpen,
  modify,
}: EventDialogProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [event, setEvent] = useState<Event>();
  const [edit, setEdit] = useState(modify ?? false);
  const [newAssignments, setNewAssignments] = useState<EventToUserAssignment[]>(
    []
  );
  const [deleteAssignments, setDeleteAssignments] = useState<
    EventToUserAssignment[]
  >([]);

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

  const newEvent = async (data: z.infer<typeof FormSchema>) => {};

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const client = getClient();

      const vars: EventCloseupQueryVariables = {
        id: id!,
      };

      const eventData = await client.request<EventCloseupQuery>(
        EventCloseupDocument,
        vars
      );

      if (eventData.events.length) {
        const e = eventData.events[0];
        setEvent({
          ...defaultEvent,
          ...e,
          tutorials: e.tutorials?.map((t) => ({
            ...defaultTutorial,
            ...t,
            event: { ...defaultEvent, ID: id },
            tutors: t.tutors.map((tu) => ({ ...defaultUser, ...tu })),
          })),
        });
        form.reset();
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setEdit(false);
        }
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(id ? updateEvent : newEvent)}>
          <DialogContent className="sm:min-w-[600px]">
            {user?.role === Role.Admin && (
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
            )}
            {loading ? (
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-3 w-[200px]" />
                <Skeleton className="h-[125px] w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-4">
                <DialogHeader className="pr-10">
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
                              className="disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-dashed border-b-2 disabled:border-none pb-2"
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
                              className="disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-dashed border-b-2 disabled:border-none pb-1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-x-2">
                      {edit ? (
                        <>
                          <BadgePicker
                            kind={LabelKind.Topic}
                            labelKindDescription="Thema"
                            selected={event?.topic}
                          />
                          <BadgePicker
                            kind={LabelKind.EventType}
                            labelKindDescription="Veranstaltungstyp"
                            selected={event?.type}
                          />
                        </>
                      ) : (
                        <>
                          <Badge
                            variant="event"
                            color={event?.topic.color || ""}
                          >
                            {event?.topic.name}
                          </Badge>
                          <Badge
                            variant="event"
                            color={event?.type.color || ""}
                          >
                            {event?.type.name}
                          </Badge>
                        </>
                      )}
                    </div>
                    {edit ? (
                      <DatePicker
                        from={event ? new Date(event.from) : undefined}
                        to={event ? new Date(event.to) : undefined}
                      />
                    ) : (
                      <FullDateDescription
                        from={new Date(event?.from)}
                        to={new Date(event?.to)}
                      />
                    )}
                  </DialogDescription>
                </DialogHeader>

                {!user && event?.tutorials?.length && (
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
                {id && (
                  <TutorialsTable
                    id={id!}
                    event={event!}
                    tutorials={event?.tutorials ?? []}
                    capacities={
                      event?.tutorials?.map((t) => t.room.capacity ?? 1) || []
                    }
                    edit={edit}
                    newAssignments={newAssignments}
                    setNewAssignments={setNewAssignments}
                    deleteAssignments={deleteAssignments}
                    setDeleteAssignments={setDeleteAssignments}
                  />
                )}
                {edit && (
                  <div className="flex flex-row space-x-2">
                    <Checkbox checked={event?.needsTutors} />
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Benötigt Tutoren
                    </label>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}

interface BadgePickerProps {
  kind: LabelKind;
  labelKindDescription?: string;
  selected: Label | undefined;
}

function BadgePicker({
  kind,
  labelKindDescription,
  selected,
}: BadgePickerProps) {
  const [sel, setSel] = useState<Label | undefined>(selected);
  const [labels, setLabels] = useState<Label[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (labels.length) return;
    const fetchData = async () => {
      setLoading(true);
      const client = getClient();

      const vars: LabelsQueryVariables = {
        kind: kind,
      };

      const labelData = await client.request<LabelsQuery>(LabelsDocument, vars);

      setLabels(labelData.labels);
      setLoading(false);
    };

    fetchData();
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Badge
          variant="event"
          color={sel?.color ?? "grey"}
          className="space-x-2 hover:cursor-pointer"
        >
          {sel ? (
            <p>{sel.name}</p>
          ) : (
            <p>{labelKindDescription ?? "Label"} auswählen</p>
          )}
          <ChevronDown className="opacity-50 h-4 w-4" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Label..." />
          <CommandList>
            <CommandEmpty>Nichts gefunden.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => (
                <CommandItem
                  key={label.name}
                  value={label.name}
                  onSelect={() => {
                    setSel(label);
                    setOpen(false);
                  }}
                >
                  <div
                    className="rounded-full w-3 h-3 mr-2"
                    style={{ backgroundColor: label.color ?? "#FFFFFF" }}
                  />
                  {label.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      label === sel ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface DatePickerProps {
  from?: Date;
  to?: Date;
}

function DatePicker({ from, to }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(from);

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-fit h-fit text-start space-x-2")}
        >
          {date ? (
            <FullDateDescription from={from!} to={to!} />
          ) : (
            <p>Pick a date</p>
          )}
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
