import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"

import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {columns} from "@/app/(form-tutor)/form-tutor/columns"
import {EventTable} from "@/app/(form-tutor)/form-tutor/event-table"
import React, {useEffect, useState} from "react"
import {getClient} from "@/lib/graphql"
import {Event, TableEventsDocument, TableEventsQuery, TableEventsQueryVariables} from "@/lib/gql/generated/graphql"
import {RowSelectionState} from "@tanstack/react-table"

const tutorRegistrationFormSchema = z.object({
  firstname: z.string().min(2, {
    message: "First name must be at least 2 characters long.",
  }),
  lastname: z.string().min(2, {
    message: "Last name must be at least 2 characters long.",
  }),
  email: z.string().email("Invalid email address").min(1, {
    message: "Please enter an email.",
  }),
  selectedEventIds: z.array(z.number()).min(1, {
    message: "Please select at least one event.",
  }),
})

interface TutorRegistrationFormProps {
  setSubmissionSuccess: React.Dispatch<React.SetStateAction<boolean>>
}

export function TutorRegistrationForm({setSubmissionSuccess}: TutorRegistrationFormProps) {
  const form = useForm<z.infer<typeof tutorRegistrationFormSchema>>({
    resolver: zodResolver(tutorRegistrationFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      selectedEventIds: [],
    },
  })
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const client = getClient();

      const vars: TableEventsQueryVariables = {
        needsTutors: true,
        onlyFuture: true,
      };

      const eventData = await client.request<TableEventsQuery>(
        TableEventsDocument,
        vars
      );

      if (eventData.events.length) {
        setEvents(eventData.events);
      }

      setLoading(false);
    };
    // FIXME: maybe try-catch it with a status for failed loading...
    fetchData();
  }, []);

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]).map(Number)
    form.setValue("selectedEventIds", selectedIds, {shouldValidate: hasTriedToSubmit})
  }, [rowSelection, form, hasTriedToSubmit])

  const resetForm = () => {
    setRowSelection({});
    form.reset()
  }

  function onValidSubmit(values: z.infer<typeof tutorRegistrationFormSchema>) {
    resetForm()
    // TODO: throw values into the backend, check if it succeeded
    console.log(values)
    setSubmissionSuccess(true)
  }


  return (
    <>
      <h1 className={'text-3xl font-bold mb-2'}>Tutor Registration</h1>
      <p className={'mb-5'}>We are happy to hear that you wanna support us as a tutor in le Vorkurs, fill out the
        below form, so we can put you into a shift</p>
      <Form {...form}>
        { /* the second callback triggers on an invalid submission */ }
        <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))} className="space-y-5 w-[50%]">
          <FormField
            control={form.control}
            name="firstname"
            render={({field}) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Maxi" {...field} />
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Musterperson" {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>email</FormLabel>
                <FormControl>
                  <Input placeholder="person@example.com" {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <FormField
            name="selectedEventIds"
            render={({field}) => (
              <FormItem>
                <FormLabel>I can help here:</FormLabel>
                <FormControl>
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    <EventTable
                      key={'table'}
                      columns={columns}
                      data={events}
                      rowSelection={rowSelection}
                      setRowSelection={setRowSelection}
                      {...field}/>
                  )}
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <Button disabled={!form.formState.isValid && hasTriedToSubmit} type="submit">Submit</Button>
        </form>
      </Form>
    </>
  )
}

export default TutorRegistrationForm