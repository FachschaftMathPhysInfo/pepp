"use client";

import {
  AddEventDocument,
  AddEventMutation,
  AddEventMutationVariables,
  Event,
  LabelKind,
  NewEvent,
  TutorialToUserAssignment,
  UmbrellaDurationDocument,
  UmbrellaDurationQuery,
  UmbrellaDurationQueryVariables,
  UpdateEventDocument,
  UpdateEventMutation,
  UpdateEventMutationVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { useRefetch, useUser } from "../providers";
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
import { extractId } from "@/lib/utils";
import { TutorialsTable } from "./tutorials-table";
import { Input } from "../ui/input";
import { defaultEvent } from "@/types/defaults";
import { Switch } from "../ui/switch";
import { BadgePicker } from "../badge-picker";
import { DatePicker } from "../date-picker";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Bitte wähle einen Veranstaltungstitel.",
  }),
  date: z.date({ required_error: "Bitte gib ein Datum an." }),
  from: z.string().min(1, { message: "Bitte gib eine Startzeit an." }),
  to: z.string().min(1, { message: "Bitte gib eine Endzeit an." }),
  topic: z.string().min(1, { message: "Bitte wähle ein Thema." }),
  type: z.string().min(1, { message: "Bitte wähle einen Veranstaltungstyp" }),
  description: z.string(),
  needsTutors: z.boolean(),
});

interface EditEventViewProps {
  event: Event | undefined;
}

export function EditEventView({ event }: EditEventViewProps) {
  const pathname = usePathname();

  const { sid } = useUser();
  const { triggerRefetch } = useRefetch();

  const [saveLoading, setSaveLoading] = useState(false);
  const [umbrella, setUmbrella] = useState<Event>();
  const [newAssignments, setNewAssignments] = useState<
    TutorialToUserAssignment[]
  >([]);
  const [deleteAssignments, setDeleteAssignments] = useState<
    TutorialToUserAssignment[]
  >([]);

  function formatToHHMM(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const mergeDateAndTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const mergedDate = new Date(date);
    mergedDate.setHours(hours, minutes, 0, 0);

    return mergedDate;
  };

  function getNewEvent(data: z.infer<typeof FormSchema>): NewEvent {
    return {
      title: data.title,
      description: data.description,
      topicName: data.topic,
      typeName: data.type,
      needsTutors: data.needsTutors,
      umbrellaID: umbrella?.ID,
      from: mergeDateAndTime(data.date, data.from),
      to: mergeDateAndTime(data.date, data.to),
    };
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      date: event ? new Date(event?.from) : new Date(),
      from: event?.from ? formatToHHMM(new Date(event.from)) : "",
      to: event?.to ? formatToHHMM(new Date(event.to)) : "",
      needsTutors: event?.needsTutors,
      topic: event?.topic.name ?? "",
      type: event?.type.name ?? "",
    },
  });

  const updateEvent = async (data: z.infer<typeof FormSchema>) => {
    setSaveLoading(true);
    const vars: UpdateEventMutationVariables = {
      event: getNewEvent(data),
      id: event?.ID!,
    };

    const sendData = async () => {
      const client = getClient(sid!);
      try {
        await client.request<UpdateEventMutation>(UpdateEventDocument, vars);
        toast.info(`"${data.title}" erfolgreich gespeichert!`);
        triggerRefetch();
      } catch (err) {
        toast.error(
          "Beim Speichern der Veranstaltung ist ein Fehler aufgetreten."
        );
      }
    };
    sendData();
    setSaveLoading(false);
  };

  const newEvent = async (data: z.infer<typeof FormSchema>) => {
    setSaveLoading(true);

    const vars: AddEventMutationVariables = {
      event: getNewEvent(data),
    };

    const sendData = async () => {
      const client = getClient(sid!);
      try {
        await client.request<AddEventMutation>(AddEventDocument, vars);
        toast.info(`"${data.title}" erfolgreich erstellt!`);
        triggerRefetch();
      } catch (err) {
        toast.error(
          "Beim Erstellen der Veranstaltung ist ein Fehler aufgetreten."
        );
      }
    };

    sendData();
    setSaveLoading(false);
  };

  useEffect(() => {
    if (event) return;

    const client = getClient();

    const fetchUmbrellaDuration = async () => {
      const vars: UmbrellaDurationQueryVariables = {
        id: extractId(pathname)!,
      };

      try {
        const umbrellaData = await client.request<UmbrellaDurationQuery>(
          UmbrellaDurationDocument,
          vars
        );

        const umbrellaEvent = umbrellaData.umbrellas[0];
        form.reset({ date: new Date(umbrellaEvent.from) });

        setUmbrella({ ...defaultEvent, ...umbrellaEvent });
      } catch {
        toast.error("Fehler beim Laden des Zeitrahmens für die Veranstaltung.");
      }
    };

    fetchUmbrellaDuration();
  }, []);

  return (
    <>
      <DialogContent className="sm:min-w-[800px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(event ? updateEvent : newEvent)}>
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            className="disabled:border-none disabled:cursor-text border-dashed border-b-2 w-full bg-transparent focus:outline-none"
                            placeholder="Veranstaltungstitel"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </DialogTitle>
                <DialogDescription className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TextareaAutosize
                            placeholder="Beschreibung der Veranstaltung"
                            className="disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-dashed border-b-2 disabled:border-none pb-1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-x-2 flex flex-row">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <BadgePicker
                              kind={LabelKind.Topic}
                              labelKindDescription="Thema"
                              selected={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <BadgePicker
                              kind={LabelKind.EventType}
                              labelKindDescription="Veranstaltungstyp"
                              selected={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-row justify-between space-x-2">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onChange={field.onChange}
                              disabled={(date) =>
                                date < new Date(umbrella?.from) ||
                                date > new Date(umbrella?.to)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Datum der Veranstaltung
                          </FormDescription>
                          <FormMessage />
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
                              <Input aria-label="Time" type="time" {...field} />
                            </FormControl>
                            <FormDescription>Von</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="to"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input aria-label="Time" type="time" {...field} />
                            </FormControl>
                            <FormDescription>Bis</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              {event && (
                <TutorialsTable
                  id={event.ID}
                  event={event!}
                  capacities={
                    event?.tutorials?.map((t) => t.room.capacity ?? 1) || []
                  }
                  edit={true}
                  newAssignments={newAssignments}
                  setNewAssignments={setNewAssignments}
                  deleteAssignments={deleteAssignments}
                  setDeleteAssignments={setDeleteAssignments}
                />
              )}
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
              <DialogFooter>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={saveLoading}
                >
                  {event ? (
                    <>
                      <Save className="h-4 w-4" />
                      Speichern
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      Hinzufügen
                    </>
                  )}
                </Button>
                {event && (
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Löschen
                  </Button>
                )}
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </>
  );
}
