import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { useRefetch, useUser } from "@/components/providers";
import { getClient } from "@/lib/graphql";
import {
  AddEventDocument,
  AddEventMutation,
  Event,
  NewEvent,
  TableEventsDocument,
  TableEventsQuery,
} from "@/lib/gql/generated/graphql";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraphQLClient } from "graphql-request";
import { DatePicker } from "@/components/date-picker";

function returnDateWithOffset(sourceDate: string, offset: number) {
  return new Date(new Date(sourceDate).getTime() + offset);
}

interface RoomFormProps {
  umbrellas: Event[];
  closeDialog: () => void;
}

export default function CopyUmbrellaForm({
  umbrellas,
  closeDialog,
}: RoomFormProps) {
  const { sid } = useUser();
  const { triggerRefetch } = useRefetch();
  const umbrellaFormSchema = z.object({
    title: z.string({
      required_error: "Bitte gib einen Titel für das Programm an",
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
  const [startingOffset, setStartingOffset] = useState<number>(0);
  const [sourceUmbrella, setSourceUmbrella] = useState<Event>(umbrellas[0]);
  const [client, setClient] = useState<GraphQLClient>(getClient());

  useEffect(() => {
    setClient(getClient(String(sid)));
  }, [sid]);

  async function fetchEventsofSourceUmbrella() {
    const eventsToAddData = await client.request<TableEventsQuery>(
      TableEventsDocument,
      { umbrellaID: sourceUmbrella.ID }
    );

    return eventsToAddData.events ?? [];
  }

  function setValues(umbrellaId: number) {
    const umbrella = umbrellas.find((umbrella) => umbrella.ID === umbrellaId);
    if (!umbrella) return;

    form.setValue("title", umbrella.title);
    form.setValue("description", umbrella.description ?? "");
    setStartingOffset(0);
    setSourceUmbrella(
      umbrellas.find((umbrella) => umbrella.ID === umbrellaId) ?? umbrellas[0]
    );
  }

  function onDatePickerChange(newFrom?: Date) {
    if (newFrom) {
      const sourceDate = new Date(sourceUmbrella.from);
      const offset = newFrom.getTime() - sourceDate.getTime();
      setStartingOffset(offset);
    }
  }

  async function createNewUmbrella(
    umbrellaData: z.infer<typeof umbrellaFormSchema>
  ): Promise<number> {
    const newUmbrella = {
      title: umbrellaData.title,
      description: umbrellaData.description,
      topicName: sourceUmbrella.topic.name,
      typeName: sourceUmbrella.type.name,
      needsTutors: false,
      from: returnDateWithOffset(sourceUmbrella.from, startingOffset),
      to: returnDateWithOffset(sourceUmbrella.to, startingOffset),
    };

    const mutation = await client.request<AddEventMutation>(AddEventDocument, {
      event: newUmbrella,
    });

    return mutation.addEvent[0];
  }

  async function createNewEvents(umbrellaID: number) {
    const sourceEvents = await fetchEventsofSourceUmbrella();

    if (!sourceEvents) return;

    const eventsToAdd: NewEvent[] = sourceEvents.map((event) => ({
      title: event.title,
      description: event.description,
      topicName: event.topic.name,
      typeName: event.type.name,
      needsTutors: event.needsTutors,
      from: returnDateWithOffset(event.from, startingOffset),
      to: returnDateWithOffset(event.to, startingOffset),
      umbrellaID: umbrellaID,
    }));

    await client.request<AddEventMutation>(AddEventDocument, {
      event: eventsToAdd,
    });
  }

  async function onValidSubmit(
    umbrellaData: z.infer<typeof umbrellaFormSchema>
  ) {
    const newUmbrellaID = await createNewUmbrella(umbrellaData);
    await createNewEvents(newUmbrellaID);

    triggerRefetch();
    closeDialog();
    toast.info("Programm wurde erfolgreich erstellt");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValidSubmit, () =>
          setHasTriedToSubmit(true)
        )}
        className="space-y-4 w-full"
      >
        <FormItem className={"flex-grow"}>
          <FormLabel>Programm</FormLabel>
          <Select
            defaultValue={String(umbrellas[0].ID)}
            onValueChange={(umbrellaId) => setValues(parseInt(umbrellaId))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Programm" />
            </SelectTrigger>
            <SelectContent>
              {umbrellas.map((umb) => (
                <SelectItem key={umb.ID} value={String(umb.ID)}>
                  {umb.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className={"flex-grow"}>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input placeholder={umbrellas[0].title} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={umbrellas[0].description ?? ""}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Neuer Startzeitpunkt</FormLabel>
          <FormControl>
            <div className={"block"}>
              <DatePicker
                selected={returnDateWithOffset(
                  sourceUmbrella.from,
                  startingOffset
                )}
                onChange={onDatePickerChange}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className={"flex justify-between items-center gap-x-12 mt-8"}>
          <Button
            onClick={closeDialog}
            variant={"outline"}
            /* else this is treated as submit button */
            type={"button"}
            className={"flex-grow-[0.5]"}
          >
            Abbrechen
          </Button>

          <Button
            disabled={!form.formState.isValid && hasTriedToSubmit}
            type="submit"
            className={"flex-grow"}
          >
            <Save />
            Speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
