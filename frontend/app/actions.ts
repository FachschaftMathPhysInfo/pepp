import {
  FormState,
  fromErrorToFormState,
  toFormState,
} from "@/lib/to-form-state";
import { client } from "@/lib/graphClient";
import {
  AddTutorDocument,
  AddTutorMutation,
  AddTutorMutationVariables,
  TutorFormEventsQuery,
  TutorFormEventsDocument,
} from "@/lib/gql/generated/graphql";

export const getEvents = async (): Promise<TutorFormEventsQuery> => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const data = await client.request<TutorFormEventsQuery>(
    TutorFormEventsDocument
  );

  return Promise.resolve(data);
};

export const addTutor = async (formState: FormState, formData: FormData) => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const firstName = formData.get("fn")?.toString() || "";
  const lastName = formData.get("sn")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const eventsAvailable = [1, 2];

  const vars: AddTutorMutationVariables = {
    firstName,
    lastName,
    email,
    eventsAvailable,
  };

  try {
    await client.request<AddTutorMutation>(AddTutorDocument, vars);
  } catch (err) {
    return fromErrorToFormState(err);
  }

  return toFormState("SUCCESS", "Anmeldung erfolgreich");
};

let selectedEvents: number[] = []

export function removeEvent(eventID: number){
  const index = selectedEvents.indexOf(eventID)
  if (index > -1) selectedEvents.splice(index, 1)
}

export function addEvent(eventID: number){
  selectedEvents.push(eventID)
}

