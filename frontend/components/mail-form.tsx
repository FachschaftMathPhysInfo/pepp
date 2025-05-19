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
import React, { useState } from "react";
import { useUser } from "@/components/providers";
import { getClient } from "@/lib/graphql";
import {
  Setting,
  UpdateSettingDocument,
  UpdateSettingMutation,
} from "@/lib/gql/generated/graphql";
import { Save, SeparatorHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@radix-ui/react-dropdown-menu";

interface SettingFormProps {
  setting: Setting;
}

export default function EditMailForm({ setting }: SettingFormProps) {
  const { sid } = useUser();

  const mailFormSchema = z.object({
    value: z.string().min(2, {
      message: "Input must be at least 2 characters long",
    }),
    key: z.string().min(2, {
      message: "Input must be at least 2 characters long",
    }),
    type: z.string().min(2, {
      message: "Input must be at least 2 characters long",
    }),
  });
  const form = useForm<z.infer<typeof mailFormSchema>>({
    resolver: zodResolver(mailFormSchema),
    defaultValues: {
      value: setting.value,
      key: setting.key,
      type: setting.type,
    },
  });

  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

  async function onValidSubmit(mailData: z.infer<typeof mailFormSchema>) {
    const client = getClient(String(sid));
    await client.request<UpdateSettingMutation>(UpdateSettingDocument, {
      setting: {
        key: mailData.key,
        value: mailData.value,
        type: mailData.type,
      },
    });
    toast.info("Mailabschnitt wurde erfolgreich bearbeitet");
  }

  return (
    <>
      <div className=" rounded-lg p-4 border-gray-800">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onValidSubmit, () =>
              setHasTriedToSubmit(true)
            )}
            className="space-y-4 w-full"
          >
            <div className="max-w-full flex">
              <div className="w-4/5 items-center justify-start">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{setting.key}</FormLabel>
                      <FormControl>
                        <Input placeholder="Seminarraum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/5 flex items-end justify-center">
                <Button
                  disabled={!form.formState.isValid && hasTriedToSubmit}
                  type="submit"
                >
                  <Save />
                  Speichern
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
