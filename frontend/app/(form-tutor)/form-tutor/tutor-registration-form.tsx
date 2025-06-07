import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { eventColumns } from "@/components/tables/event-table/event-columns";
import { EventTable } from "@/components/tables/event-table/event-table";
import React, { useEffect, useState } from "react";
import { getClient } from "@/lib/graphql";
import {
  AddEventAvailabilityOfTutorDocument,
  AddEventAvailabilityOfTutorMutation, AddEventAvailabilityOfTutorMutationVariables,
  Event,
  TableEventsDocument,
  TableEventsQuery,
  TableEventsQueryVariables, TutorRegistrationDocument, TutorRegistrationMutation, TutorRegistrationMutationVariables
} from "@/lib/gql/generated/graphql";
import { RowSelectionState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {toast} from "sonner";


interface TutorRegistrationFormProps {
  setSubmissionSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setUserMail: React.Dispatch<React.SetStateAction<string>>;
}

export default function TutorRegistrationForm({ setSubmissionSuccess, setUserMail }: TutorRegistrationFormProps) {
  const tutorRegistrationFormSchema = z.object({
    firstName: z.string().min(2, {
      message: "Bitte gib mindestens 2 Zeichen ein.",
    }),
    lastName: z.string().min(2, {
      message: "Bitte gib mindestens 2 Zeichen ein.",
    }),
    email: z.string().email("Ungültiges E-Mail Format.").min(1, {
      message: "Bitte gib eine E-Mail an",
    }),
    eventsAvailable: z.array(z.number()).min(1, {
      message: "Bitte wähle mindestens eine Veranstaltung aus.",
    }),
  });
  const form = useForm<z.infer<typeof tutorRegistrationFormSchema>>({
    resolver: zodResolver(tutorRegistrationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      eventsAvailable: [],
    },
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const client = getClient();
      const vars: TableEventsQueryVariables = {
        needsTutors: true,
        onlyFuture: true,
      };
      const eventData = await client.request<TableEventsQuery>(TableEventsDocument, vars);
      if (eventData.events.length) {
        setEvents(eventData.events);
      }
      setLoading(false);
    };
    void fetchData()
  }, []);

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number);
    form.setValue("eventsAvailable", selectedIds, { shouldValidate: hasTriedToSubmit });
  }, [rowSelection, form, hasTriedToSubmit]);

  async function onValidSubmit(tutorData: z.infer<typeof tutorRegistrationFormSchema>) {
    try {
      let client = getClient();
      const tutorRegistrationData: TutorRegistrationMutationVariables = {
        firstName: tutorData.firstName,
        lastName: tutorData.lastName,
        email: tutorData.email,
      };

      const sid = await client.request<TutorRegistrationMutation>(
        TutorRegistrationDocument,
        tutorRegistrationData
      );

      client = getClient(sid.addUser)

      const availabilityData: AddEventAvailabilityOfTutorMutationVariables = {
        email: tutorData.email,
        eventsAvailable: tutorData.eventsAvailable
      }

      await client.request<AddEventAvailabilityOfTutorMutation>(
        AddEventAvailabilityOfTutorDocument,
        availabilityData
      );

      finishSubmission()
    } catch (error) {
      handleError(String(error))
    }
  }

  const resetForm = () => {
    setRowSelection({});
    form.reset();
  };

  const handleError = (error: string) => {
    if(error.includes("Error: constraint failed: UNIQUE constraint failed: users.mail")){
      form.setError('email', {type: 'custom', message:'Diese E-Mail wird bereits verwendet, bitte melde dich an um deine Verfügbarkeiten zu ändern'})

    // If the server has problems sending the mail, the user will still be added, should be discussed later
    } else if (error.includes("failed to send email:") || error.includes("Error: dial tcp")) {
      finishSubmission()

    } else {
      toast.error(
        'Ein Problem ist aufgetreten, sollte es später nicht funktionieren, melde dich bei vorkurs@mathphys.info'
      );
    }
  }

  const finishSubmission = () => {
    setUserMail(form.getValues('email'))
    setSubmissionSuccess(true)
    resetForm();
  }

  return (
    <div className={cn(' max-[800px]:max-w-[90vw] max-w-[70vw] flex flex-col items-center')}>
      <h1 className="text-4xl font-bold mb-4 text-center">Tutor:innen Registrierung</h1>
      <p className="mb-6 text-center">
        Es freut uns, dass Du Interesse hast uns beim Vorkurs zu unterstützen. Bitte gib uns hier deine Kontaktdaten und
        die Veranstaltungen bei denen du als Tutor:in aushelfen kannst an.<br /> Im Anschluss werden wir dir eine E-Mail
        senden, mit deren Hilfe du dich dann im System registrieren kannst.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))} className="space-y-6 w-full">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel >Vorname</FormLabel>
                <FormControl>
                  <Input placeholder="Maxi" {...field} autoComplete={'given-name'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nachname</FormLabel>
                <FormControl>
                  <Input placeholder="Musterperson" {...field} autoComplete={'family-name'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input placeholder="person@example.com" {...field} autoComplete={'email'}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="eventsAvailable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bei diesen Veranstaltungen kann ich helfen</FormLabel>
                <FormControl>
                  {loading ? (
                    <p className="text-center">Loading...</p>
                  ) : (
                    <EventTable
                      key="table"
                      columns={eventColumns}
                      data={events}
                      rowSelection={rowSelection}
                      setRowSelection={setRowSelection}
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-full"
            disabled={!form.formState.isValid && hasTriedToSubmit}
            type="submit"
          >
            Abschicken
          </Button>
        </form>
      </Form>
    </div>
  );
}
