"use client";

import {
  AddEventDocument,
  AddEventMutation,
  AddEventMutationVariables,
  Event,
  EventToUserAssignment,
  LabelKind,
  UmbrellaDurationDocument,
  UmbrellaDurationQuery,
  UmbrellaDurationQueryVariables,
  UpdateEventMutationVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { Edit3, PlusCircle, Save, Trash, Trash2 } from "lucide-react";
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { defaultEvent, defaultTutorial, defaultUser } from "@/types/defaults";
import { Switch } from "../ui/switch";
import { BadgePicker } from "../badge-picker";
import { DatePicker } from "../date-picker";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

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
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function EditEventView({ event, setOpen }: EditEventViewProps) {
  const pathname = usePathname();

  const { user, sid } = useUser();
  const [saveLoading, setSaveLoading] = useState(false);
  const [umbrella, setUmbrella] = useState<Event>();
  const [newAssignments, setNewAssignments] = useState<EventToUserAssignment[]>(
    []
  );
  const [deleteAssignments, setDeleteAssignments] = useState<
    EventToUserAssignment[]
  >([]);

  function formatToHHMM(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      date: event?.from,
      from: formatToHHMM(new Date(event?.from)),
      to: formatToHHMM(new Date(event?.to)),
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

    const mergeDateAndTime = (date: Date, time: string) => {
      const [hours, minutes] = time.split(":").map(Number);

      const mergedDate = new Date(date);
      mergedDate.setHours(hours, minutes, 0, 0);

      return mergedDate;
    };

    const vars: AddEventMutationVariables = {
      event: {
        title: data.title,
        description: data.description,
        topicName: data.topic,
        typeName: data.type,
        needsTutors: data.needsTutors,
        umbrellaID: umbrella?.ID,
        from: mergeDateAndTime(data.date, data.from),
        to: mergeDateAndTime(data.date, data.to),
      },
    };

    const sendData = async () => {
      const client = getClient(sid!);
      try {
        await client.request<AddEventMutation>(AddEventDocument, vars);
      } catch (err) {
        console.log(err);
      }
    };

    sendData();
    setSaveLoading(false);
    toast(`"${data.title}" erfolgreich erstellt!`, {
      description: `Am ${format(data.date, "PPP")}`,
    });
    setOpen(false)
  };

  useEffect(() => {
    const client = getClient();

    const fetchUmbrellaDuration = async () => {
      const vars: UmbrellaDurationQueryVariables = {
        id: extractId(pathname)!,
      };

      const umbrellaData = await client.request<UmbrellaDurationQuery>(
        UmbrellaDurationDocument,
        vars
      );

      const umbrellaEvent = umbrellaData.umbrellas[0];

      form.reset({ date: new Date(umbrellaEvent.from) });

      setUmbrella({ ...defaultEvent, ...umbrellaEvent });
    };

    fetchUmbrellaDuration();
  }, [event]);

  return (
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
                      <FormDescription>Datum der Veranstaltung</FormDescription>
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
                  Personen können sich für diese Veranstaltung als verfügbare/r
                  Tutor/in eintragen.
                </FormDescription>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" variant="secondary" disabled={saveLoading}>
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
  );
}
