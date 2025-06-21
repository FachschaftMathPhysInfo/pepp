"use client";

import {DatePickerWithRange} from "@/components/date-picker-with-range";
import EventDialog from "@/components/event-dialog/event-dialog";
import {useUser} from "@/components/providers";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Form, FormControl, FormDescription, FormField, FormItem, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
  Event,
  UmbrellaDetailDocument,
  UmbrellaDetailQuery,
  UmbrellaDetailQueryVariables,
  UpdateEventDocument,
  UpdateEventMutation,
  UpdateEventMutationVariables,
} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";
import {cn, slugify} from "@/lib/utils";
import {defaultEvent} from "@/types/defaults";
import {zodResolver} from "@hookform/resolvers/zod";
import {addDays} from "date-fns";
import {Edit3, PlusCircle, Save} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Bitte gib einen Veranstaltungstitel an.",
  }),
});

interface EditPlannerSectionProps {
  umbrellaID: number;
}

export default function EditPlannerSection({
  umbrellaID,
}: EditPlannerSectionProps) {
  const router = useRouter();

  const { sid } = useUser();

  const [umbrella, setUmbrella] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: umbrella?.title ?? "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {

      const client = getClient();

      const vars: UmbrellaDetailQueryVariables = {
        id: umbrellaID,
      };

      const umbrellaData = await client.request<UmbrellaDetailQuery>(
        UmbrellaDetailDocument,
        vars
      );

      setUmbrella({ ...defaultEvent, ...umbrellaData.umbrellas[0] });

      form.reset({ title: umbrellaData.umbrellas[0].title });

    };

    void fetchData();
  }, [umbrellaID]);

  if (!umbrella) return;

  function onDatePickerClose(from: Date | undefined, to: Date | undefined) {
    if (!from || !to || (from === umbrella?.from && to === umbrella.to)) return;

    const pushChanges = async () => {
      const client = getClient(sid!);

      // i dont understand why we need to add a day here,
      // but at this point i am too desperate to question it
      const vars: UpdateEventMutationVariables = {
        id: umbrellaID,
        event: {
          title: umbrella!.title,
          needsTutors: false,
          from: addDays(from, 1),
          to: addDays(to, 1),
        },
      };

      await client.request<UpdateEventMutation>(UpdateEventDocument, vars);
    };

    void pushChanges();
    toast("Veranstaltungsdauer erfolgreich angepasst!");
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const pushChanges = async () => {
      const client = getClient(sid!);

      const vars: UpdateEventMutationVariables = {
        id: umbrellaID,
        event: {
          title: data.title,
          needsTutors: false,
          from: umbrella?.from,
          to: umbrella?.to,
        },
      };

      await client.request<UpdateEventMutation>(UpdateEventDocument, vars);
    };

    void pushChanges();
    toast("Veranstaltungstitel erfolgreich angepasst!");
    router.push(slugify(data.title) + "-" + umbrellaID);
    setOpen(false);
  }

  return (
    <>
      <div className="flex flex-row space-x-2">
        <h1 className="text-3xl font-semibold">{umbrella.title}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost">
              <Edit3 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w[425px]">
            <DialogHeader>
              <DialogTitle>Veranstaltungstitel anpassen</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-2/3 space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={`Vorkurs ${new Date().getFullYear()}`}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Unter diesem Titel werden später viele
                        Unterveranstaltungen gelistet.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  <Save className="h-4 w-4" />
                  Speichern
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-row justify-between">
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <EventDialog open={eventDialogOpen} modify={true} />
        </Dialog>
        <Button
          className={cn("h-[40px] w-auto justify-start text-left font-normal")}
          onClick={() => setEventDialogOpen(true)}
        >
          <PlusCircle />
          Event hinzufügen
        </Button>
        <DatePickerWithRange
          initialDateFrom={umbrella.from}
          initialDateTo={umbrella.to}
          onClose={onDatePickerClose}
        />
      </div>
    </>
  );
}
