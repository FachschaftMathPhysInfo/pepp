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
import React, { useState } from "react";
import { useUser } from "@/components/providers";
import { getClient } from "@/lib/graphql";
import {
  Setting,
  UpsertSettingDocument,
  UpsertSettingMutation,
} from "@/lib/gql/generated/graphql";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { ResetIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";

interface SettingFormProps {
  settings: Setting[];
}

export default function EditMailForm({ settings }: SettingFormProps) {
  const { sid } = useUser();
  const mailFormSchema = z.object({
    values: z.array(
      z.string().min(2, {
        message: "Mailabschnitt muss mindestens 2 Zeichen lang sein",
      })
    ),
  });
  const form = useForm<z.infer<typeof mailFormSchema>>({
    resolver: zodResolver(mailFormSchema),
    defaultValues: {
      values: settings.map((setting) => setting.value),
    },
  });
  const [initialValues, setInitalValues] = useState<string[]>(
    settings.map((setting) => setting.value)
  );

  function resetForm() {
    form.setValue("values", initialValues);
  }

  async function onValidSubmit(mailData: z.infer<typeof mailFormSchema>) {
    const client = getClient(String(sid));

    // FIXME: Schreib mal wer nen arrray support hierfür :c
    for (const settingValue of mailData.values) {
      const index = mailData.values.indexOf(settingValue);
      await client.request<UpsertSettingMutation>(UpsertSettingDocument, {
        setting: {
          key: settings[index].key,
          value: settingValue,
          type: settings[index].type,
        },
      });
    }

    const currentValues = form.getValues("values");
    setInitalValues(currentValues);
    form.reset({
      values: currentValues,
    });
    toast.info("Mailabschnitt wurde erfolgreich bearbeitet");
  }

  return (
    <div className=" rounded-lg p-4 border-gray-800">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onValidSubmit)}
          className="space-y-4 w-full flex flex-col items-end"
        >
          {settings.map((setting, index) => (
            <div key={index} className={"w-full"}>
              <FormField
                control={form.control}
                name={`values.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {setting.key
                        .replace(/email/g, " ")
                        .replace(/-/g, " ")
                        .replace(/(^\w)|(\s+\w)/g, (letter) =>
                          letter.toUpperCase()
                        )}
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <div className={"flex w-full space-x-8"}>
            <Button
              type={"button"}
              variant={"outline"}
              className={"flex-grow-[0.4]"}
              onClick={resetForm}
            >
              Zurücksetzen
              <ResetIcon />
            </Button>

            <Button
              disabled={!form.formState.isValid || !form.formState.isDirty}
              type="submit"
              className={"flex-grow-[0.6]"}
            >
              <Save />
              Speichern
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
