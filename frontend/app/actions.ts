import { client } from "@/lib/graphClient";
import {
  AddTutorDocument,
  AddTutorMutation,
  AddTutorMutationVariables,
  TutorFormEventsQuery,
  TutorFormEventsDocument,
} from "@/lib/gql/generated/graphql";
import {eventBroker} from "@/lib/eventBroker";

export const getEvents = async (): Promise<TutorFormEventsQuery> => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const data = await client.request<TutorFormEventsQuery>(
    TutorFormEventsDocument
  );

  return Promise.resolve(data);
};

export const addTutor = async (formData: FormData) => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const firstName = formData.get("firstName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const eventsAvailable = eventBroker.getEvents();

  const vars: AddTutorMutationVariables = {
    firstName,
    lastName,
    email,
    eventsAvailable,
  };

  try {
    await client.request<AddTutorMutation>(AddTutorDocument, vars);
  } catch (err) {
    return ['FAILURE', 'Beim Absenden des Formulares, ist ein Fehler aufgetreten, versuche es später erneut'];
  }

  return ['SUCCESS', 'Anmeldung erfolgreich!'];
};
