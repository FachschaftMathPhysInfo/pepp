"use client"

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {UpdateUserDocument, UpdateUserMutation} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";


export default function AccountForm() {
  const {user, sid} = useUser()

  const accountFormSchema = z.object({
    email: z.string().email({
      message: "Bitte gib eine gültige E-Mail an"
    }),
    firstname: z.string().min(2, "Bitte gib einen Vornamen an"),
    lastname: z.string().min(2, "Bitte gib einen Nachnamen an"),
  });
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user?.mail,
      firstname: user?.fn,
      lastname: user?.sn
    },
  });
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

  async function onValidSubmit(userData: z.infer<typeof accountFormSchema>) {
    const client = getClient(String(sid));
    const updateData = {
      email: userData.email,
      fn: userData.firstname,
      sn: userData.lastname,
      role: user?.role,
    }

    try {
      await client.request<UpdateUserMutation>(UpdateUserDocument, {updateData})
    } catch {
      toast.error('Ein Fehler ist aufgetreten, versuche es später erneut')
    }
    toast.info('Dein Account wurde bearbeitet')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))}
            className="space-y-4 w-full">

        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem className={'flex-grow'}>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input placeholder={user?.mail} {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstname"
          render={({field}) => (
            <FormItem>
              <FormLabel>Vorname</FormLabel>
              <FormControl>
                <Input placeholder={user?.fn} {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastname"
          render={({field}) => (
            <FormItem>
              <FormLabel>Nachname</FormLabel>
              <FormControl>
                <Input placeholder={user?.sn} {...field}/>
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
