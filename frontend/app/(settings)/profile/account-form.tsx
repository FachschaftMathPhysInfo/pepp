"use client"

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {getClient} from "@/lib/graphql";
import {UpdateUserDocument, UpdateUserMutation, UpdateUserMutationVariables} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {useUser} from "@/components/provider/user-provider";


export default function AccountForm() {
  const {user, sid} = useUser()
  const [mailEditedDialogOpen, setMailEditedDialogOpen] = useState(false)
  const [showUnconfirmed, setShowUnconfirmed] = useState<boolean>(false)
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
    if (!user || !sid) {
      toast.error("Ein Fehler ist aufgetreten, melde dich erneut an")
      return
    }

    const client = getClient(sid);

    const updateData: UpdateUserMutationVariables = {
      user: {
        mail: userData.email,
        fn: userData.firstname,
        sn: userData.lastname,
        role: user?.role,
      },
      id: user.ID
    }

    try {
      await client.request<UpdateUserMutation>(UpdateUserDocument, updateData)
    } catch {
      toast.error('Ein Fehler ist aufgetreten, versuche es später erneut')
      return
    }

    if (user.mail !== userData.email) setMailEditedDialogOpen(true)

    toast.info('Dein Account wurde bearbeitet')
  }

  return (
    <>
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
                <FormMessage className={'text-red-600'}>
                  {!user?.confirmed || showUnconfirmed && (
                    "Deine Mail wurde noch nicht bestätigt, dadurch sind die Funktionen deines Accounts eingeschränkt"
                  )}
                </FormMessage>
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

      <ConfirmationDialog
        mode="information"
        isOpen={mailEditedDialogOpen}
        closeDialog={() => {
          setMailEditedDialogOpen(false)
          setShowUnconfirmed(true)
        }}
        description="Bestätige bitte deine neue E-Mail-Addresse innerhalb der nächsten Stunde durch den Link der an dein Postfach gesendet wurde."
        information="E-Mail verändert!"
      />
    </>
  );
}
