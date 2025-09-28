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
  SubscribeToEventDocument,
  SubscribeToEventMutation,
  UmbrellasDocument,
  UmbrellasQuery,
  UnsubscribeFromEventDocument,
  UnsubscribeFromEventMutation,
  UpdateEventDocument,
  UpdateEventMutation,
} from "@/lib/gql/generated/graphql";
import { ChevronsUpDown, Save } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerWithRange } from "@/components/date-picker-with-range";
import { getNextWeek } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface EditUmbrellaFormProps {
  umbrella: Event;
  closeDialog: () => void;
  createMode: boolean;
}

// This is the edit AND create form... give it a better name if you find one
export default function EditUmbrellaForm({
  umbrella,
  closeDialog,
  createMode = false,
}: EditUmbrellaFormProps) {
  const { sid } = useUser();
  const { triggerRefetch } = useRefetch();

  const umbrellaFormSchema = z.object({
    title: z.string().nonempty({
      message: "Bitte gib einen Titel für das Programm an",
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
  const [duration, setDuration] = useState<{ from: Date; to: Date }>({
    from: createMode ? new Date() : new Date(umbrella.from),
    to: createMode ? getNextWeek() : new Date(umbrella.to),
  });
  const [umbrellas, setUmbrellas] = useState<
    {
      id: number;
      title: string;
    }[]
  >([]);
  const [sourceUmbrellaIDs, setSourceUmbrellaIDs] = useState<number[]>([]);

  useEffect(() => {
    const fetchUmbrellas = async () => {
      const client = getClient(String(sid));

      const umbrellaData = await client.request<UmbrellasQuery>(
        UmbrellasDocument
      );
      setUmbrellas(
        umbrellaData.umbrellas.map((umb) => ({
          id: umb.ID,
          title: umb.title,
        }))
      );
      setSourceUmbrellaIDs(
        umbrellaData.umbrellas
          .filter((u) =>
            umbrella.supportingEvents?.map((e) => e.ID).includes(u.ID)
          )
          .map((u) => u.ID)
      );
    };

    void fetchUmbrellas();
  }, [sid]);

  function onDatePickerClose(from?: Date, to?: Date) {
    if (from && to) setDuration({ from: from, to: to });
  }

  async function onValidSubmit(
    umbrellaData: z.infer<typeof umbrellaFormSchema>
  ) {
    const client = getClient(String(sid));
    const newEvent: NewEvent = {
      title: umbrellaData.title,
      description: umbrellaData.description,
      from: duration.from,
      to: duration.to,
      needsTutors: false,
      tutorialsOpen: false,
      registrationNeeded: true,
    };

    if (createMode) {
      await client.request<AddEventMutation>(AddEventDocument, {
        event: newEvent,
      });
    } else {
      await client.request<UpdateEventMutation>(UpdateEventDocument, {
        id: umbrella.ID,
        event: newEvent,
      });
    }

    await handleSubscriptions();

    triggerRefetch();
    closeDialog();
    toast.info(
      createMode
        ? "Programm wurde erfolgreich erstellt"
        : "Programm wurde erfolgreich bearbeitet"
    );
  }

  async function handleSubscriptions() {
    const client = getClient(String(sid));
    const idsToAdd = sourceUmbrellaIDs.filter(
      (source) => !umbrella.supportingEvents?.map((e) => e.ID).includes(source)
    );
    const idsToRemove =
      umbrella.supportingEvents
        ?.map((e) => e.ID)
        .filter((id) => !sourceUmbrellaIDs.includes(id)) ?? [];

    try {
      if (idsToAdd.length > 0) {
        await client.request<SubscribeToEventMutation>(
          SubscribeToEventDocument,
          {
            subscriberID: umbrella.ID,
            sourceIDs: idsToAdd,
          }
        );
      }

      if (idsToRemove.length > 0) {
        await client.request<UnsubscribeFromEventMutation>(
          UnsubscribeFromEventDocument,
          {
            subscriberID: umbrella.ID,
            sourceIDs: idsToRemove,
          }
        );
      }
    } catch {
      toast.error("Importieren von externen Events ist fehlgeschlagen");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValidSubmit, () =>
          setHasTriedToSubmit(true)
        )}
        className="space-y-4 w-full"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className={"flex-grow"}>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input placeholder={umbrella.title} {...field} />
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
                  placeholder={createMode ? "" : umbrella.description ?? ""}
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
          <FormMessage />
        </FormItem>

        <FormItem className={"flex-grow"}>
          <FormLabel>Importiert Events von</FormLabel>
          <Popover modal>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-1/2 h-fit space-x-2 flex justify-between items-center"
              >
                {sourceUmbrellaIDs.length > 0 ? (
                  <div className="flex flex-col items-start">
                    {sourceUmbrellaIDs.length == 1
                      ? umbrellas.find((umb) => umb.id === sourceUmbrellaIDs[0])
                          ?.title
                      : `${sourceUmbrellaIDs.length} ausgewählt`}
                  </div>
                ) : (
                  <p>Programm wählen</p>
                )}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Suche Titel..." />
                <CommandList>
                  <CommandEmpty>Kein Programm gefunden</CommandEmpty>
                  <CommandGroup>
                    {umbrellas.map((umb) => {
                      const isSelected = !!sourceUmbrellaIDs.find(
                        (id) => id === umb.id
                      );
                      // umbrella cannot import itself
                      if (umb.id === umbrella.ID) return;

                      return (
                        <CommandItem
                          key={umb.id}
                          value={umb.title}
                          onSelect={() => {
                            if (isSelected) {
                              setSourceUmbrellaIDs((prev) =>
                                prev.filter((id) => id !== umb.id)
                              );
                            } else {
                              setSourceUmbrellaIDs((prev) => [...prev, umb.id]);
                            }
                          }}
                        >
                          <Checkbox className="mr-2" checked={isSelected} />
                          <div className="flex flex-col">{umb.title}</div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
