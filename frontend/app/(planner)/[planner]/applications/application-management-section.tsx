"use client"

import React, {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {LoaderCircle, MailCheck, MailX} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getClient} from "@/lib/graphql";
import {
  AcceptNewApplicationsDocument,
  AcceptNewApplicationsMutation,
  DenyRemainingApplicationsDocument
} from "@/lib/gql/generated/graphql";
import {toast} from "sonner";
import {useUser} from "@/components/provider/user-provider";

interface ApplicationManagementSectionProps {
  umbrellaID: number
  triggerRefetch: () => void;
  maximumNewStudents: number
}

export default function ApplicationManagementSection(props: ApplicationManagementSectionProps) {
  const numberSchema = z.object({
    amountNewStudents: z.coerce.number({
      required_error: "Bitte gib eine Zahl an",
      message: "Bitte gib eine Zahl an",
    }).min(1, 'Bitte gib eine Zahl größer 1 an')
      .max(props.maximumNewStudents, `Es gibt nur ${props.maximumNewStudents} weitere Bewerbungen`),
  })

  const {sid} = useUser()
  const [dialogOpen, setDialogOpen] = useState<"accept" | "deny" | null>(null);
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
    setDialogOpen("accept")
  }

  async function handleNewStudents() {
    setLoading(true)
    try {
      const client = getClient(String(sid));
      await client.request<AcceptNewApplicationsMutation>(
        AcceptNewApplicationsDocument,
        {eventID: props.umbrellaID, count: amountNewStudents}
      )
      props.triggerRefetch()
      toast.success("Weitere Studis wurden erfolgreich angenommen")
    } catch {
      toast.error("Fehler beim akzeptieren der Studis")
    }
    setLoading(false)
  }

  async function handleDeny() {
    const client = getClient(String(sid));

    try {
      await client.request(DenyRemainingApplicationsDocument, {eventID: props.umbrellaID});
      props.triggerRefetch()
      toast.success("Die restlichen Studis wurden erfolgreich abgelehnt")
    } catch {
      toast.error("Ein Fehler beim Senden der Mails ist aufgetreten.")
    } finally {
      setDialogOpen(null)
    }
  }

  return (
    <>
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
                      <FormMessage className={'w-full text-right'}/>
                    </FormItem>
                  )}
                />

                <div className={'w-full flex items-center justify-end gap-x-6'}>
                  <Button type={'button'} variant={'outline'} onClick={() => setDialogOpen("deny")}>
                    {loading ? (
                      <><LoaderCircle className={'animate-spin'}/> Versende Mails </>
                    ) : (
                      <><MailX/> Restliche Studis ablehnen </>
                    )}
                  </Button>

                  <Button type={'submit'} variant={"destructive"}>
                    {loading ? (
                      <><LoaderCircle className={'animate-spin'}/> Versende Mails </>
                    ) : (
                      <><MailCheck/> Studis zulassen</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        description={`Dies wird eine Mail an weitere ${amountNewStudents} schicken und diese zum Programm einladen`}
        isOpen={dialogOpen === "accept"}
        closeDialog={() => setDialogOpen(null)}
        onConfirm={handleNewStudents}
        mode={"confirmation"}
      />

      <ConfirmationDialog
        description={`Dies wird eine Mail an alle noch nicht zugelassenen Studis senden und sie informieren, dass sie nicht zu diesem Programm angenommen wurden`}
        isOpen={dialogOpen === "deny"}
        closeDialog={() => setDialogOpen(null)}
        onConfirm={handleDeny}
        mode={"confirmation"}
      />
    </>
  )
}