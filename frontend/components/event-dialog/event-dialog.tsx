"use client";

import {
  AddEventDocument,
  AddEventMutation,
  AddEventMutationVariables,
  Event,
  EventCloseupDocument,
  EventCloseupQuery,
  EventCloseupQueryVariables,
  EventToUserAssignment,
  LabelKind,
  Role,
  UpdateEventMutationVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { Edit3, Save } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn, extractId } from "@/lib/utils";
import { TutorialsTable } from "./tutorials-table";
import { Input } from "../ui/input";
import { FullDateDescription } from "../full-date-description";
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import { usePathname } from "next/navigation";
import { Switch } from "../ui/switch";
import { BadgePicker } from "../badge-picker";
import { DatePicker } from "../date-picker";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Titel darf nicht leer sein.",
  }),
  date: z.date(),
  from: z.string(),
  to: z.string(),
  topic: z.string(),
  type: z.string(),
  description: z.string(),
  needsTutors: z.boolean(),
});

interface EventDialogProps {
  id?: number;
  modify?: boolean;
  children: React.ReactNode;
}

export default function EventDialog({
  id,
  modify,
  children,
}: EventDialogProps) {
  const pathname = usePathname();

  const { user, sid } = useUser();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
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
      from: event?.from,
      to: event?.to,
      needsTutors: event?.needsTutors,
      topic: event?.topic.name,
      type: event?.type.name,
    },
  });

  const updateEvent = async (data: z.infer<typeof FormSchema>) => {
    setSaveLoading(true);

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

  const newEvent = async (data: z.infer<typeof FormSchema>) => {
    setSaveLoading(true);

    const vars: AddEventMutationVariables = {
      event: { ...data, umbrellaID: extractId(pathname) },
    };

    const sendData = async () => {
      const client = getClient(sid!);
      await client.request<AddEventMutation>(AddEventDocument, vars);
    };

    sendData();
    setSaveLoading(false);
  };

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
      onOpenChange={(open) => {
        if (!open) {
          setEdit(false);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(id ? updateEvent : newEvent)}>
          <DialogContent className="sm:min-w-[600px]">
            {user?.role === Role.Admin && (
              <DialogAction>
                {edit ? (
                  <>
                    <Save
                      type="submit"
                      className="h-4 w-4"
                      onClick={() => setEdit(false)}
                    />
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
                              className="disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-dashed border-b-2 disabled:border-none pb-2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DialogTitle>
                  <DialogDescription
                    className={cn(edit ? "space-y-4" : "space-y-2")}
                  >
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
                          <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                              <BadgePicker
                                kind={LabelKind.Topic}
                                labelKindDescription="Thema"
                                selected={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <BadgePicker
                                kind={LabelKind.EventType}
                                labelKindDescription="Veranstaltungstyp"
                                selected={field.value}
                                onChange={field.onChange}
                              />
                            )}
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
                      <div className="flex flex-row justify-between">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <DatePicker
                                  selected={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription>
                                Datum der Veranstaltung
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-row space-x-2">
                          <FormField
                            control={form.control}
                            name="from"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    aria-label="Time"
                                    type="time"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>Von</FormDescription>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="to"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    aria-label="Time"
                                    type="time"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>Bis</FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
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
                  <FormField
                    control={form.control}
                    name="needsTutors"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-row space-x-2 mt-10">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <p className="text-sm text-muted-foreground">
                              Benötigt Tutoren
                            </p>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Personen können sich für diese Veranstaltung als
                          verfügbare/r Tutor/in eintragen.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
