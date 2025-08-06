"use client"

import {useRefetch, useUser} from "@/components/providers";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useState} from "react";
import {
  AddEventDocument,
  AddEventMutation,
  DeleteEventDocument,
  DeleteEventMutation,
  Event,
  LabelKind,
  NewEvent,
  UpdateEventDocument,
  UpdateEventMutation
} from "@/lib/gql/generated/graphql"
import {getClient} from "@/lib/graphql";
import {toast} from "sonner";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {PlusCircle, Save, Trash} from "lucide-react";
import {BadgePicker} from "@/components/badge-picker";
import {DatePicker} from "@/components/date-picker";
import {Checkbox} from "@/components/ui/checkbox";
import {DialogFooter} from "@/components/ui/dialog";
import {formatDateToHHMM} from "@/lib/utils";

const eventFormSchema = z.object({
  title: z.string().nonempty("Bitte gib einen Titel für die Veranstaltung an"),
  description: z.string().optional(),
  date: z.date(),
  from: z.string().nonempty("Bitte gib eine Startzeit an."),
  to: z.string().nonempty("Bitte gib eine Endzeit an."),
  topicID: z.number({required_error: "Bitte wähle das Thema der Veranstaltung"}),
  typeID: z.number({required_error: "Bitte wähle den Typ der Veranstaltung"}),
  needsTutors: z.boolean(),
})

interface EventFormProps {
  event: Event | null;
  edit: boolean;
  onCloseAction: () => void;
}

export function EventForm({event, edit, onCloseAction}: EventFormProps) {
  const {sid} = useUser();
  const {triggerRefetch} = useRefetch();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      date: event ? new Date(event.from) : new Date(),
      from: formatDateToHHMM(event ? new Date(event.from) : new Date()),
      to: formatDateToHHMM(event ? new Date(event.to) : new Date(Date.now() + 30 * 60 * 1000)),
      topicID: event?.topic.ID ?? 0,
      typeID: event?.type.ID ?? 0,
      needsTutors: event?.needsTutors ?? true,
    }
  })

  async function handleSave(data: z.infer<typeof eventFormSchema>) {
    const newEvent: NewEvent = {
      title: data.title,
      description: data.description,
      topicID: data.topicID,
      typeID: data.typeID,
      needsTutors: data.needsTutors,
      from: mergeDateAndTime(data.date, data.from),
      to: mergeDateAndTime(data.date, data.to),
    }

    if (event) await handleUpdate(data, newEvent);
    else await handleCreation(data, newEvent);
  }

  const mergeDateAndTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const mergedDate = new Date(date);
    mergedDate.setHours(hours, minutes, 0, 0);

    return mergedDate;
  };

  async function handleCreation(data: z.infer<typeof eventFormSchema>, newEvent: NewEvent) {
    const client = getClient(String(sid))

    try {
      await client.request<AddEventMutation>(AddEventDocument, {event: newEvent})
      toast.success(`Event ${data.title} wurde erstellt`)
      triggerRefetch()
      onCloseAction()
    } catch {
      toast.error("Ein Fehler beim Erstellen des Events ist aufgtreten")
    }
  }

  async function handleUpdate(data: z.infer<typeof eventFormSchema>, newEvent: NewEvent) {
    const client = getClient(String(sid))

    try {
      await client.request<UpdateEventMutation>(
        UpdateEventDocument,
        {id: event?.ID, event: newEvent}
      )
      toast.success(`Event ${data.title} wurde aktualisiert`)
      triggerRefetch()
      onCloseAction()
    } catch {
      toast.error("Ein Fehler beim Aktualisieren des Events ist aufgetreten")
    }
  }

  async function handleDelete() {
    if (!event) return;

    try {
      const client = getClient(String(sid))
      await client.request<DeleteEventMutation>(DeleteEventDocument, {eventIds: [event.ID]})
      triggerRefetch()
      toast.success(`Event ${event.title} wurde gelöscht`)
      onCloseAction();
    } catch {
      toast.error("Ein Fehler beim Löschen des Events ist aufgetreten")
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave, () => setSubmitted(true))}
        className={'w-full flex flex-col gap-y-4'}
      >
        <FormField
          control={form.control}
          name="title"
          render={({field}) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input placeholder="Veranstaltungstitel" {...field}  />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Textarea placeholder="Beschreibung des Events" {...field}  />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        {/* Time */}
        <div className={'flex items-cente justify-between flex-wrap gap-2'}>
          <FormField
            control={form.control}
            name="date"
            render={({field}) => (
              <FormItem>
                <FormLabel className={'hidden'}>Datum</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="from"
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input aria-label="start time" type="time" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to"
              render={({field}) => (
                <FormItem className={'flex items-center gap-2'}>
                  bis
                  <FormControl>
                    <Input aria-label="Time" type="time" placeholder={event?.to} {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Labels */}
        <div className={'flex items-center justify-between flex-wrap gap-2'}>
          <div className={'flex items-center gap-2'}>
            <FormField
              control={form.control}
              name="topicID"
              render={({field}) => (
                <FormItem>
                  <FormLabel className={'hidden'}>Thema</FormLabel>
                  <FormControl>
                    <BadgePicker
                      kind={LabelKind.Topic}
                      selected={field.value}
                      onChange={(label) => field.onChange(label)}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="typeID"
              render={({field}) => (
                <FormItem>
                  <FormLabel className={'hidden'}>Art des Events</FormLabel>
                  <FormControl>
                    <BadgePicker
                      kind={LabelKind.EventType}
                      selected={field.value}
                      onChange={(label) => field.onChange(label)}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>


          <FormField
            control={form.control}
            name="needsTutors"
            render={({field}) => (
              <FormItem>
                <FormLabel className={'hidden'}>Benötigt Tutor:innen</FormLabel>
                <FormControl>
                <span className={'flex items-center gap-2 min-w-fit'}>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Benötigt Tutor:innen
                </span>
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>

        {/* Footer */}
        <div className="w-full flex justify-between items-center mt-8">
          <Button
            type={"button"}
            variant={"outline"}
            onClick={() => handleDelete()}
            className={'aspect-square'}
          >
            <Trash className={'stroke-destructive'}/>
          </Button>

          <DialogFooter className={'flex items-center gap-4'}>
            <Button type="button" variant={"outline"} onClick={onCloseAction}>
              Abbrechen
            </Button>
            <Button type={"submit"} disabled={!form.formState.isValid && submitted}>
              {edit ? (
                <><Save/> Speichern</>
              ) : (
                <><PlusCircle/> Erstellen</>
              )}
            </Button></DialogFooter>
        </div>
      </form>
    </Form>
  )
}