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
  Event,
  SubscribeToEventDocument,
  SubscribeToEventMutation,
  UmbrellasDocument,
  UmbrellasQuery, UnsubscribeFromEventDocument, UnsubscribeFromEventMutation,
  UpdateEventDocument,
  UpdateEventMutation
} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea";
import {DatePickerWithRange} from "@/components/date-picker-with-range";
import {getNextWeek} from "@/lib/utils";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Checkbox} from "@/components/ui/checkbox";


interface RoomFormProps {
  umbrella: Event;
  closeDialog: () => void;
  refreshTable: () => Promise<void>;
  createMode: boolean;
}

// This is the edit AND create form... give it a better name if you find one
export default function EditUmbrellaForm({umbrella, closeDialog, refreshTable, createMode = false}: RoomFormProps) {
  const {sid} = useUser()
  const umbrellaFormSchema = z.object({
    title: z.string().nonempty({
      message: "Bitte gib einen Titel für das Programm an"
    }),
    description: z.string().optional(),
  });
  const form = useForm<z.infer<typeof umbrellaFormSchema>>({
    resolver: zodResolver(umbrellaFormSchema),
    defaultValues: {
      title: createMode ? "" : umbrella.title,
      description: createMode ? "" : umbrella.description ?? "",
    },
  });
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);
  const [duration, setDuration] = useState<{ from: Date, to: Date }>({
    from: createMode ? new Date() : new Date(umbrella.from),
    to: createMode ? getNextWeek() : new Date(umbrella.to),
  });
  const [umbrellas, setUmbrellas] = useState<{
    id: number,
    title: string
  }[]>([])
  const [sourceUmbrellaIDs, setSourceUmbrellaIDs] = useState<number[]>([]);

  useEffect(() => {
    const fetchUmbrellas = async () => {
      const client = getClient(String(sid));

      try {
        const umbrellaData = await client.request<UmbrellasQuery>(UmbrellasDocument)
        setUmbrellas(umbrellaData.umbrellas.map(umb => ({
          id: umb.ID,
          title: umb.title,
        })))
        setSourceUmbrellaIDs(umbrellaData.umbrellas.filter(
          u => umbrella.supportingEvents?.map(
            e => e.ID).includes(
              u.ID)).map(
                u => u.ID)
        )
      } catch (e) {
        console.error('Failed fetching umbrellas: ', e)
      }
    }

    void fetchUmbrellas();
  }, [sid]);

  function onDatePickerClose(from?: Date, to?: Date) {
    if (from && to) setDuration({from: from, to: to});
  }

  async function onValidSubmit(umbrellaData: z.infer<typeof umbrellaFormSchema>) {
    const client = getClient(String(sid));
    const newEvent = {
      title: umbrellaData.title,
      description: umbrellaData.description,
      from: duration.from,
      to: duration.to,
      needsTutors: false
    }

    if (createMode) {
      try {
        await client.request<AddEventMutation>(AddEventDocument, {
          event: newEvent,
        })
      } catch (e) {
        console.error('Failed creating umbrella: ', e)
      }

    } else {
      try {
        await client.request<UpdateEventMutation>(UpdateEventDocument, {
          id: umbrella.ID,
          event: newEvent
        })
      } catch (e) {
        console.error('Failed updating umbrella: ', e)
      }
    }

    await handleSubscriptions()

    void refreshTable();
    closeDialog();
    toast.info(createMode ? 'Programm wurde erfolgreich erstellt' : "Programm wurde erfolgreich bearbeitet")
  }

  async function handleSubscriptions() {
    const client = getClient(String(sid));
    const idsToAdd= sourceUmbrellaIDs.filter(
      source => !(umbrella.supportingEvents?.map(e => e.ID).includes(source))
    )
    const idsToRemove = umbrella.supportingEvents?.map(e => e.ID).filter(
      id => !(sourceUmbrellaIDs.includes(id))
    ) ?? []

    try {
      if(idsToAdd.length > 0) {
        await client.request<SubscribeToEventMutation>(SubscribeToEventDocument, {
          subscriberID: umbrella.ID,
          sourceIDs: idsToAdd,
        })
      }

      if(idsToRemove.length > 0) {
        await client.request<UnsubscribeFromEventMutation>(UnsubscribeFromEventDocument, {
          subscriberID: umbrella.ID,
          sourceIDs: idsToRemove
        })
      }
    } catch (e) {
      toast.error('Importieren von externen Events ist fehlgeschlagen')
      console.error('Failed subscribing to event: ', e)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))}
            className="space-y-4 w-full">

        <FormField
          control={form.control}
          name="title"
          render={({field}) => (
            <FormItem className={'flex-grow'}>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input placeholder={umbrella.title} {...field}/>
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
                <Textarea placeholder={createMode ? "" : umbrella.description ?? ""} {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Zeitraum</FormLabel>
          <FormControl>
            <DatePickerWithRange
              initialDateFrom={duration.from}
              initialDateTo={duration.to}
              onClose={onDatePickerClose}
              modal={true}
            />
          </FormControl>
          <FormMessage/>
        </FormItem>

        <FormItem className={'flex-grow'}>
          <FormLabel>Importiert Events von</FormLabel>
          <Popover modal={true}>
            <PopoverTrigger className="flex w-1/2 items-center justify-start">
              <div className={'border w-full border-muted-background py-1 px-4 rounded-lg text-start text-muted-foreground'}>
                {sourceUmbrellaIDs.length === 1  ? (
                  `${umbrellas.find(umb => umb.id === sourceUmbrellaIDs[0])?.title}`
                ) : (
                  `${sourceUmbrellaIDs.length} ausgewählt`
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className={'w-fit'}>
              {umbrellas.filter(umb => umb.id !== umbrella.ID).map((umb) => (
                <div key={umb.id} className={'flex items-center'}>
                  <Checkbox
                    checked={sourceUmbrellaIDs.includes(umb.id)}
                    onClick={() => {
                      if (sourceUmbrellaIDs.includes(umb.id)) {
                        const newArray = [...sourceUmbrellaIDs]
                        const index = newArray.indexOf(umb.id, 0);
                        if (index > -1) {
                          newArray.splice(index, 1);
                        }
                        setSourceUmbrellaIDs(newArray);
                      } else {
                        setSourceUmbrellaIDs([...sourceUmbrellaIDs, umb.id])
                      }
                    }}
                    className={'mr-5'}
                  />
                  {umb.title}
                </div>
              ))}
            </PopoverContent>
          </Popover>
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
