import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {
  AddEventDocument,
  AddEventMutation,
  Event,
  UpdateEventDocument,
  UpdateEventMutation
} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea";
import {DatePickerWithRange} from "@/components/date-picker-with-range";
import {getNextWeek} from "@/lib/utils";


interface RoomFormProps {
  umbrella: Event;
  // for copy function later
  umbrellas: Event[];
  closeDialog: () => void;
  refreshTable: () => Promise<void>;
  createMode: boolean;
}

export default function EditUmbrellaForm({umbrella, umbrellas, closeDialog, refreshTable, createMode = false}: RoomFormProps) {
  const {sid} = useUser()
  const roomFormSchema = z.object({
    title: z.string({
      required_error: "Bitte gib einen Titel für das Programm an"
    }),
    description: z.string().optional(),
  });
  const form = useForm<z.infer<typeof roomFormSchema>>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      title: createMode ? "" : umbrella.title,
      description: createMode ? "" : umbrella.description ?? "",
    },
  });
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);
  const [duration, setDuration] = useState<{from: string, to: string}>({
    from: umbrella.from === "" ? new Date() : umbrella.from,
    to: umbrella.to === "" ? getNextWeek() : umbrella.to,
  });

  function onDatePickerClose (from?: Date, to?: Date) {
    if (from && to) setDuration({from: from.toISOString(), to: to.toISOString()});
  }

  async function onValidSubmit(umbrellaData: z.infer<typeof roomFormSchema>) {
    const client = getClient(String(sid));
    const newEvent = {
      title: umbrellaData.title,
      description: umbrellaData.description,
      from: duration.from,
      to: duration.to,
      needsTutors: false
    }

    if(createMode) {
      await client.request<AddEventMutation>(AddEventDocument, {
        event: newEvent,
      })
    } else {
      await client.request<UpdateEventMutation>(UpdateEventDocument, {
        id: umbrella.ID,
        event: newEvent
      })
    }

    void refreshTable();
    closeDialog();
    toast.info(createMode ? 'Programm wurde erfolgreich erstellt' : "Programm wurde erfolgreich bearbeitet")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))}
            className="space-y-4 w-full">

        <div className={'flex justify-between w-full flex-wrap gap-x-4'}>
          <FormField
            control={form.control}
            name="title"
            render={({field}) => (
              <FormItem className={'flex-grow-[0.75]'}>
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder={umbrella.title} {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Textarea placeholder={ createMode ? "" : umbrella.description ?? ""} {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Zeitraum</FormLabel>
          <FormControl>
            <DatePickerWithRange
              from={createMode ? new Date() : new Date(umbrella.from)}
              to={createMode ? getNextWeek() : new Date(umbrella.to)}
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
