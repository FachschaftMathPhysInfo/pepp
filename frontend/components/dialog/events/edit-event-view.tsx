"use client";

import {
  AddEventDocument,
  AddEventMutation,
  AddEventMutationVariables,
  AddTutorialsDocument,
  AddTutorialsMutation,
  DeleteEventDocument,
  DeleteEventMutation,
  DeleteTutorialsDocument,
  DeleteTutorialsMutation,
  Event,
  LabelKind,
  NewEvent,
  NewTutorial,
  Tutorial,
  UmbrellaDurationDocument,
  UmbrellaDurationQuery,
  UmbrellaDurationQueryVariables,
  UpdateEventDocument,
  UpdateEventMutation,
  UpdateEventMutationVariables,
  UpdateTutorialDocument,
  UpdateTutorialMutation,
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
import { useRefetch, useUser } from "../../providers";
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
import { Input } from "../../ui/input";
import { defaultEvent } from "@/types/defaults";
import { Switch } from "../../ui/switch";
import { BadgePicker } from "../../badge-picker";
import { DatePicker } from "../../date-picker";
import { Button } from "../../ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/confirmation-dialog";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Bitte wähle einen Veranstaltungstitel.",
  }),
  date: z.date({ required_error: "Bitte gib ein Datum an." }),
  from: z.string().min(1, { message: "Bitte gib eine Startzeit an." }),
  to: z.string().min(1, { message: "Bitte gib eine Endzeit an." }),
  topic: z.number().min(1, { message: "Bitte gib eine Veranstaltungsart an."}),
  type: z.number().min(1, { message: "Bitte wähle einen Veranstaltungstyp" }),
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
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [tutorials, setTutorials] = useState(event?.tutorials ?? []);

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
      topicID: data.topic,
      typeID: data.type,
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
      topic: event?.topic.ID ?? 0,
      type: event?.type.ID ?? 0,
    },
  });

  const updateEvent = async (data: z.infer<typeof FormSchema>) => {
    setSaveLoading(true);

    if (!event) {
      toast.error("Ein Fehler ist aufgetreten, versuche es später erneut");
      return;
    }

    function mapTutorialToNewTutorial(t: Tutorial): NewTutorial {
      return {
        eventID: event?.ID ?? 0,
        roomNumber: t.room.number,
        buildingID: t.room.building.ID,
        tutors: t.tutors?.map((u) => u.ID),
      };
    }

    const newTutorials: NewTutorial[] = tutorials
      .filter((t) => t.ID < 0)
      .map((t) => mapTutorialToNewTutorial(t));

    const updateTutorials: Tutorial[] = tutorials.filter((t) => t.ID > 0);

    const deleteTutorialIDs: number[] =
      event.tutorials
        ?.filter((t) => {
          if (!tutorials.find((tut) => t.ID === tut.ID)) return t;
        })
        .map((t) => t.ID) ?? [];

    const vars: UpdateEventMutationVariables = {
      event: getNewEvent(data),
      id: event.ID,
    };

    const sendData = async () => {
      const client = getClient(sid!);
      try {
        await client.request<UpdateEventMutation>(UpdateEventDocument, vars);
        if (newTutorials.length) {
          await client.request<AddTutorialsMutation>(AddTutorialsDocument, {
            tutorials: newTutorials,
          });
        }
        if (deleteTutorialIDs.length) {
          await client.request<DeleteTutorialsMutation>(
            DeleteTutorialsDocument,
            { tutorialIDs: deleteTutorialIDs }
          );
        }
        if (updateTutorials.length) {
          updateTutorials.forEach(async (t) => {
            await client.request<UpdateTutorialMutation>(
              UpdateTutorialDocument,
              { id: t.ID, tutorial: mapTutorialToNewTutorial(t) }
            );
          });
        }
        toast.info(`"${data.title}" erfolgreich gespeichert!`);
        triggerRefetch();
      } catch {
        toast.error(
          "Beim Speichern der Veranstaltung ist ein Fehler aufgetreten."
        );
      }
    };
    await sendData();
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
      } catch {
        toast.error(
          "Beim Erstellen der Veranstaltung ist ein Fehler aufgetreten."
        );
      }
    };

    await sendData();
    setSaveLoading(false);
  };

  const deleteThisEvent = async () => {
    const client = getClient(sid!);
    try {
      await client.request<DeleteEventMutation>(DeleteEventDocument, {
        eventIds: [event?.ID],
      });
      toast.info(`"${event?.title}" erfolgreich gelöscht!`);
      triggerRefetch();
    } catch {
      toast.error("Beim Löschen der Veranstaltung ist ein Fehler aufgetreten.");
    }
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

    void fetchUmbrellaDuration();
  }, []);

  return (
    <>
      <ConfirmationDialog
        isOpen={deleteConfirmationOpen}
        mode="confirmation"
        onConfirm={deleteThisEvent}
        closeDialog={() => setDeleteConfirmationOpen(false)}
        description={`Diese Aktion wird die Veranstaltung "${event?.title}" und die zugehörigen Tutorien unwideruflich löschen.`}
      />

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
                  tutorials={tutorials}
                  setTutorialsAction={setTutorials}
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
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteConfirmationOpen(true)}
                  >
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
