import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useEffect, useState} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {
  AddEventDocument,
  AddEventMutation,
  AddTutorialDocument,
  AddTutorialMutation,
  Event, NewEvent, NewTutorial,
  TableEventsDocument,
  TableEventsQuery,
  TutorialsOfEventDocument,
  TutorialsOfEventQuery
} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea";
import {DatePickerWithRange} from "@/components/date-picker-with-range";
import {getNextWeek} from "@/lib/utils";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {GraphQLClient} from "graphql-request";


interface RoomFormProps {
  umbrellas: Event[];
  closeDialog: () => void;
  refreshTable: () => Promise<void>;
}

export default function CopyUmbrellaForm({umbrellas, closeDialog, refreshTable}: RoomFormProps) {
  const {sid} = useUser()
  const umbrellaFormSchema = z.object({
    title: z.string({
      required_error: "Bitte gib einen Titel für das Programm an"
    }),
    description: z.string().optional(),
  });
  const form = useForm<z.infer<typeof umbrellaFormSchema>>({
    resolver: zodResolver(umbrellaFormSchema),
    defaultValues: {
      title: umbrellas[0].title,
      description: umbrellas[0].description ?? "",
    },
  });
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);
  const [duration, setDuration] = useState<{from: string, to: string}>({
    from: umbrellas[0].from === "" ? new Date() : umbrellas[0].from,
    to: umbrellas[0].to === "" ? getNextWeek() : umbrellas[0].to,
  });
  const [sourceUmbrella, setSourceUmbrella] = useState<Event>(umbrellas[0]);
  const [client, setClient] = useState<GraphQLClient>(getClient());

  useEffect(() => {
    setClient(getClient(String(sid)))
  }, [sid]);

  async function fetchEventsofSourceUmbrella() {
    const eventsToAddData = await client.request<TableEventsQuery>(
      TableEventsDocument,
      {umbrellaID: sourceUmbrella.ID}
    )

    return eventsToAddData.events ?? []
  }

  function setValues(umbrellaId: number) {
    const umbrella = umbrellas.find((umbrella) => umbrella.ID === umbrellaId);
    if (!umbrella) return;

    form.setValue('title', umbrella.title)
    form.setValue('description', umbrella.description ?? "")
    setDuration({
      from: umbrella.from,
      to: umbrella.to,
    })
    setSourceUmbrella(umbrellas.find(umbrella => umbrella.ID === umbrellaId) ?? umbrellas[0])
  }

  function onDatePickerClose (from?: Date, to?: Date) {
    if (from && to) setDuration({from: from.toISOString(), to: to.toISOString()});
  }

  async function createNewUmbrella(umbrellaData: z.infer<typeof umbrellaFormSchema>): Promise<number> {
    const newUmbrella = {
      title: umbrellaData.title,
      description: umbrellaData.description,
      topicName: sourceUmbrella.topic.name,
      typeName: sourceUmbrella.type.name,
      needsTutors: false,
      from: duration.from,
      to: duration.to,
    }

    const mutation = await client.request<AddEventMutation>(AddEventDocument, {event: newUmbrella})

    return mutation.addEvent[0]
  }

  async function createNewEvents(umbrellaID: number) {
    const sourceEvents = await fetchEventsofSourceUmbrella();
    const eventsToAdd: NewEvent[] = sourceEvents.map(
      event => ({
        title: event.title,
        description: event.description,
        topicName: event.topic.name,
        typeName: event.type.name,
        needsTutors: event.needsTutors,
        from: event.from,
        to: event.to,
        umbrellaID: umbrellaID
      }))

    if (!eventsToAdd) return;
    console.log(eventsToAdd);
    const mutation = await client.request<AddEventMutation>(AddEventDocument, {event: eventsToAdd})

    return mutation.addEvent
  }

  function createNewTutorials(events: number[]) {
    console.log('Creating Tutorials...')

    async function addTutorialsToEvent(eventID: number, index: number){
      console.log('Tutorial for event no: ', index)

      const sourceEvents = await fetchEventsofSourceUmbrella()

      const tutorialsToAddData  = await client.request<TutorialsOfEventQuery>(
        TutorialsOfEventDocument,
        {
          eventID: sourceEvents.map(event => event.ID)[index],
        }
      )

      const tutorialsToAdd: NewTutorial[] = tutorialsToAddData.tutorials.map((tutorial) => ({
        eventID: eventID,
        roomNumber: tutorial.room.number,
        buildingID: tutorial.room.building.ID,
        tutors: tutorial.tutors?.map((tutor) => tutor.mail)
      }))

      console.log('Tuts to add: ', tutorialsToAdd)

      await client.request<AddTutorialMutation>(AddTutorialDocument, {tutorials: tutorialsToAdd})
    }

    events.forEach((eventID, index) => {
      void addTutorialsToEvent(eventID, index)
    })
  }

  async function onValidSubmit(umbrellaData: z.infer<typeof umbrellaFormSchema>) {
    const newUmbrellaID = await createNewUmbrella(umbrellaData)
    const newEventIDs = await createNewEvents(newUmbrellaID)
    if(newEventIDs) {
      void createNewTutorials(newEventIDs)
    }

    void refreshTable();
    closeDialog();
    toast.info('Programm wurde erfolgreich erstellt')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))}
            className="space-y-4 w-full">

        <FormItem className={'flex-grow'}>
          <FormLabel>Programm</FormLabel>
          <Select
            defaultValue={String(umbrellas[0].ID)}
            onValueChange={umbrellaId => setValues(parseInt(umbrellaId))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Programm" />
            </SelectTrigger>
            <SelectContent>
              {umbrellas.map(umb => (
                <SelectItem key={umb.ID} value={String(umb.ID)}>{umb.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <FormField
          control={form.control}
          name="title"
          render={({field}) => (
            <FormItem className={'flex-grow'}>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input placeholder={umbrellas[0].title} {...field}/>
              </FormControl>
              <FormMessage />
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
                <Textarea placeholder={umbrellas[0].description ?? ""} {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Zeitraum</FormLabel>
          <FormControl>
            <DatePickerWithRange
              from={new Date(duration.from)}
              to={new Date(duration.to)}
              onClose={onDatePickerClose}
            />
          </FormControl>
          <FormMessage/>
        </FormItem>

        <div className={'flex justify-between items-center gap-x-12 mt-8'}>
          <Button
            onClick={closeDialog}
            variant={"outline"}
            /* else this is treated as submit button */
            type={"button"}
            className={'flex-grow-[0.5]'}
          >
            Abbrechen
          </Button>

          <Button
            disabled={!form.formState.isValid && hasTriedToSubmit}
            type="submit"
            className={'flex-grow'}
          >
            <Save/>
            Speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
