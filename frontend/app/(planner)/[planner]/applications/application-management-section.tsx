"use client"

import React, {useCallback, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Mail} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {AllApplicantsDocument, AllApplicantsQuery} from "@/lib/gql/generated/graphql";
import {Applicant} from "@/app/(planner)/[planner]/applications/application-info-section";

interface ApplicationManagementSectionProps {
  umbrellaID: number
}

const numberSchema = z.object({
  amount: z.coerce.number({
    required_error: "Bitte gib eine Zahl an",
    message: "Bitte gib eine Zahl an",
  }).min(1, 'Bitte gib eine Zahl größer 1 an')
})

export default function ApplicationManagementSection(props: ApplicationManagementSectionProps) {
  const { sid } = useUser()
  const [amountNewStudents, setAmountNewStudents] = useState<number>(0);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof numberSchema>>({
    resolver: zodResolver(numberSchema),
    defaultValues: {
      amount: 0,
    },
  });
  const [potentialApplicants, setPotentialApplicants] = useState<Applicant[]>([]);

  const fetchApplicants = useCallback(async () => {
    const client = getClient(String(sid));
    const data = await client.request<AllApplicantsQuery>(AllApplicantsDocument, {})
    const applicants: Applicant[] = data.users.filter(
      user => user.applications?.find(
        application => application.event.ID === props.umbrellaID
      )
    )

    if(!applicants.length) return;

    const notAcceptedApplicants = applicants.filter(applicant => applicant.applications?.find(
      application => application.event.ID === props.umbrellaID
    )?.accepted || false)

    setPotentialApplicants(notAcceptedApplicants);
  }, [props.umbrellaID]);

  useEffect(() => {
    void fetchApplicants();
  }, [props.umbrellaID]);

  // TODO
  function handleNewStudents() {}

  function onSubmit(data: z.infer<typeof numberSchema>) {
    setAmountNewStudents(data.amount)
    setConfirmationDialogOpen(true)
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
                  name="amount"
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
                <Mail/>
                Bestätigen
              </Button>
            </form>
          </Form>

          <ConfirmationDialog
            description={`Dies wird eine Mail an weitere ${amountNewStudents} schicken und diese zum Programm einladen`}
            isOpen={confirmationDialogOpen}
            closeDialog={() => setConfirmationDialogOpen(false)}
            onConfirm={async () => void handleNewStudents()}
            mode={"confirmation"}
          />
        </div>
      </CardContent>
    </Card>
  )
}