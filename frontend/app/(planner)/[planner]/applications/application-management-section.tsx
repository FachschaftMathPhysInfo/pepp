"use client"

import React, {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {LoaderCircle, Mail} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {AcceptNewApplicationsDocument, AcceptNewApplicationsMutation} from "@/lib/gql/generated/graphql";
import {toast} from "sonner";

interface ApplicationManagementSectionProps {
  umbrellaID: number
}

const numberSchema = z.object({
  amountNewStudents: z.coerce.number({
    required_error: "Bitte gib eine Zahl an",
    message: "Bitte gib eine Zahl an",
  }).min(1, 'Bitte gib eine Zahl größer 1 an')
})

export default function ApplicationManagementSection(props: ApplicationManagementSectionProps) {
  const {sid} = useUser()
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof numberSchema>>({
    resolver: zodResolver(numberSchema),
    defaultValues: {
      amountNewStudents: 0,
    },
  });
  const [amountNewStudents, setAmountNewStudents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  async function onSubmit(data: z.infer<typeof numberSchema>) {
    setAmountNewStudents(data.amountNewStudents);
    setConfirmationDialogOpen(true)
  }

  async function handleNewStudents() {
    setLoading(true)
    try {
      const client = getClient(String(sid));
      await client.request<AcceptNewApplicationsMutation>(
        AcceptNewApplicationsDocument,
        {eventID: props.umbrellaID, count: amountNewStudents}
      )
    } catch (error) {
      console.error(error)
      toast.error("Fehler beim akzeptieren der Sutdis")
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'text-center'}>
          Verwaltung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={'w-full flex justify-between items-center'}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={'w-full flex flex-col space-y-6'}
            >
              <FormField
                control={form.control}
                name="amountNewStudents"
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                        <span className={'w-full flex items-center justify-between space-x-6'}>
                          <span className={'whitespace-nowrap'}>Weitere Studis zulassen:</span>
                          <Input placeholder="0" {...field} className={'w-[200px]'}/>
                        </span>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <Button type={'submit'} variant={"destructive"}>
                {loading ? (<><LoaderCircle/> Lade</>) : (<><Mail/> Bestätigen</>)}
              </Button>
            </form>
          </Form>

          <ConfirmationDialog
            description={`Dies wird eine Mail an weitere ${amountNewStudents} schicken und diese zum Programm einladen`}
            isOpen={confirmationDialogOpen}
            closeDialog={() => setConfirmationDialogOpen(false)}
            onConfirm={handleNewStudents}
            mode={"confirmation"}
          />
        </div>
      </CardContent>
    </Card>
  )
}