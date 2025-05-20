import {Form, FormControl, FormDescription, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Save} from "lucide-react";
import {z} from "zod";
import {getClient} from "@/lib/graphql";
import {
  Event,
  UpdateEventDocument,
  UpdateEventMutation,
  UpdateEventMutationVariables
} from "@/lib/gql/generated/graphql";
import {toast} from "sonner";
import {slugify} from "@/lib/utils";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useUser} from "@/components/providers";
import React from "react";
import {DatePickerWithRange} from "@/components/date-picker-with-range";

const PlannerFormSchema = z.object({
  title: z.string().min(1, {
    message: "Bitte gib einen Veranstaltungstitel an.",
  }),
});

interface EditPlannerFormProps {
  umbrellaID: number;
  umbrella: Event | null;
  closeDialog: () => void;
}

export default function EditPlannerForm( {umbrellaID, umbrella, closeDialog}: EditPlannerFormProps ) {
  const router = useRouter();
  const { sid } = useUser();
  const form = useForm<z.infer<typeof PlannerFormSchema>>({
    resolver: zodResolver(PlannerFormSchema),
    defaultValues: {
      title: umbrella?.title ?? "",
    },
  });

  if (!umbrella) return;
  
  function onDatePickerClose(from: Date | undefined, to: Date | undefined) {
    if (!from || !to || (from === umbrella?.from && to === umbrella.to)) return;

    const pushChanges = async () => {
      const client = getClient(sid!);

      const vars: UpdateEventMutationVariables = {
        id: umbrellaID,
        event: {
          title: umbrella!.title,
          needsTutors: false,
          from: from,
          to: to,
        },
      };

      await client.request<UpdateEventMutation>(UpdateEventDocument, vars);
    };

    void pushChanges();
    toast("Veranstaltungsdauer erfolgreich angepasst!");
  }

  // TODO: Date picker stuff should be submitted with save button
  function onSubmit(data: z.infer<typeof PlannerFormSchema>) {
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
    void router.push(slugify(data.title) + "-" + umbrellaID);
    closeDialog();
  }
  
  return (
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
      <FormField
        name="timespan"
        render={() => (
          <FormItem>
              <DatePickerWithRange
                from={umbrella.from}
                to={umbrella.to}
                onClose={onDatePickerClose}
              />
            <FormDescription>
              Der Zeitraum der Veranstaltung.
            </FormDescription>
          </FormItem>
        )}
      />
      <Button type="submit">
        <Save className="h-4 w-4" />
        Speichern
      </Button>
    </form>
  </Form>
  )
}