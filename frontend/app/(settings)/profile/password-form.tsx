"use client"

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useEffect, useState} from "react";
import {Save} from "lucide-react";
import {toast} from "sonner";


export default function PasswordForm() {
  const passwordFormSchema = z.object({
    currentPassword: z.string().nonempty(),
    newPassword: z
      .string()
      .min(8, {message: "Muss mindestens 8 Zeichen lang sein."})
      .regex(new RegExp(".*[A-Z].*"), {
        message: "Muss einen Großbuchstaben enthalten.",
      })
      .regex(new RegExp(".*\\d.*"), {message: "Muss eine Nummer enthalten."})
      .regex(new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"), {
        message: "Muss ein Sonderzeichen enthalten.",
      }),
    confirmNewPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein.",
  });
  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    },
  });
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);
  const [samePassword, setSamePassword] = useState(false);

  useEffect(() => {
    setSamePassword(form.getValues("newPassword") === form.getValues("confirmNewPassword"))
  }, [form])

  async function onValidSubmit(userData: z.infer<typeof passwordFormSchema>) {
    toast.info('Not Yet Implemented')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))}
            className="space-y-4 w-full">

        <FormField
          control={form.control}
          name="currentPassword"
          render={({field}) => (
            <FormItem className={'flex-grow'}>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder={''} type={"password"} {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({field}) => (
            <FormItem>
              <FormLabel>Neues Passwort</FormLabel>
              <FormControl>
                <Input placeholder={''} type={"password"} {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({field}) => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
              <FormControl>
                <Input placeholder={''} type={"password"} {...field}/>

              </FormControl>
              <FormMessage>
                {!samePassword && "Passwörter stimmen nicht überein"}
              </FormMessage>
            </FormItem>
          )}
        />

        <div className={'w-full flex justify-end items-center gap-x-12 mt-8'}>

          <Button
            disabled={!form.formState.isValid && hasTriedToSubmit}
            type="submit"
          >
            <Save/>
            Speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
