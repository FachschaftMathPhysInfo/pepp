"use client"

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {Save} from "lucide-react";
import {toast} from "sonner";
import {ChangePasswordDocument, ChangePasswordMutation, LoginDocument, LoginQuery} from "@/lib/gql/generated/graphql";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";


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
    path: ["confirmNewPassword"],
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
  const {user, sid} = useUser();

  async function onValidSubmit(userData: z.infer<typeof passwordFormSchema>) {
    if (!user) {
      toast.error('Ein Fehler ist aufgetreten')
      console.error('User is undefined change password action')
      return
    }

    const client = getClient(String(sid));

    // Check Password Validity
    try {
      await client.request<LoginQuery>(LoginDocument, {
        mail: user.mail,
        password: userData.currentPassword
      })

      if(form.formState.errors.currentPassword) form.clearErrors('currentPassword')
    } catch {
      form.setError('currentPassword', {
        message: 'Das angegebene Passwort ist falsch'
      })
      return
    }

    const updateData = {
      mail: user.mail,
      fn: user.mail,
      sn: user.mail,
      confirmed: user.confirmed,
      role: user.role,
      password: userData.newPassword
    }

    try {
      await client.request<ChangePasswordMutation>(ChangePasswordDocument, {user: updateData})
      toast.info('Dein Passwort wurde verändert')
      console.log(`Changed password for ${user.mail}`)
      setHasTriedToSubmit(false)
      form.reset()
    } catch (error) {
      toast.error('Ein Fehler beim updaten des Passworts ist aufgetreten')
      console.error(error)
    }
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
                <Input
                  placeholder={''}
                  type={"password"}
                  {...field}/>
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
                <Input
                  placeholder={''}
                  type={"password"}
                  {...field}/>
              </FormControl>
              <FormMessage/>
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
