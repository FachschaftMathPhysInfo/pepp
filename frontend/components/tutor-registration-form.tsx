"use client";

import { SubmitButton } from "./submit-button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { z } from "zod"
import {FormEvent, useState} from "react";
import {eventBroker} from "@/lib/eventBroker";
import {FieldError} from "@/components/field-error";
import {cn} from "@/lib/utils/tailwindUtils";
import {addTutor} from "@/app/actions";
import {EMPTY_FORM_STATE} from "@/lib/to-form-state";

const EventTable = dynamic(() => import("@/app/form-tutor/ui/table/event-table"), {
  ssr: false,
});

const tableDivStyling = "my-5 md:min-h-32 grow ";

const validationSchema = z.object({
  firstName: z.string().min(1, "Bitte Vorname angeben"),
  lastName: z.string().min(1, "Bitte Nachname eingeben"),
  email: z.string()
    .email("Bitte gültige Email angeben"),
  availableEvents: z.array(z.string())
    .min(1, "Wähle mindestens eine der Veranstaltungen aus")
})

const TutorRegistrationForm = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<boolean | undefined>()

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

      const validationResult = validationSchema.safeParse({
        firstName: firstName,
        lastName: lastName,
        email: email,
        availableEvents: eventBroker.getEvents()
      });

      if (!validationResult.success) {
        let errMessages: string[] = [];
        let errFields: string[] = [];
        const { errors: err } = validationResult.error;
        for (var i = 0; i < err.length; i++) {
          errMessages.push(err[i].message);
          errFields.push(err[i].path[0].toString())
        }
        setErrorMessages(errMessages);
        setErrorFields(errFields)
      } else {
        let submitResponse: any[] = await addTutor(new FormData(event.currentTarget));
        setSubmitStatus(submitResponse[0]);
        setSubmitMessage(submitResponse[1]);
      }
}

  return (
    <form onSubmit={submitHandler} className="flex flex-col w-[85%] md:w-[50%] xl:w-[35%] md:h-[calc(100vh-10rem)] mx-auto pb-3">
      <div className={"w-full my-1 grow-0"}>
        <Input type="text"
               name="firstName"
               placeholder="Vorname"
               onChange={e => setFirstName(e.target.value)}
               className={errorFields.includes('firstName') ? 'border-red-500 border-2' : ''}
        />
        {errorFields.includes('firstName') &&
          <FieldError
            message={errorMessages[errorFields.indexOf('firstName')]}
          />
        }
      </div>

      <div className={"w-full my-1 grow-0"}>
        <Input type="text"
               name="lastName"
               placeholder="Nachname"
               onChange={e => setLastName(e.target.value)}
               className={errorFields.includes('lastName') ? 'border-red-500 border-2' : ''}
        />
        {errorFields.includes('lastName') &&
          <FieldError
            message={errorMessages[errorFields.indexOf('lastName')]}
          />
        }
      </div>

      <div className={cn("w-full row-0 my-1", errorFields.includes('email') ? 'mb-0' : '')}>
        <Input type="email"
               name="email"
               placeholder="E-Mail"
               onChange={e => setEmail(e.target.value)}
               className={errorFields.includes('email') ? 'border-red-500 border-2' : ''}
        />
        {errorFields.includes('email') &&
          <FieldError
            message={errorMessages[errorFields.indexOf('email')]}
          />
        }
      </div>

      <div className={tableDivStyling}>
        <div className={cn('w-full h-full', (errorFields.includes('availableEvents') ? 'border-red-500 border-2 rounded-md' : ''))}>
          <EventTable />
        </div>

        {errorFields.includes('availableEvents') &&
          <FieldError
            message={errorMessages[errorFields.indexOf('availableEvents')]}
          />
        }
      </div>

      {(!!submitStatus) &&
        <span className={cn('text-xs', (submitStatus ? 'text-green-700' : 'text-red-500'))}>
          {submitMessage}
        </span>
      }
      <SubmitButton label="Anmelden" loading="Bitte warten"/>
    </form>
  );
};

export { TutorRegistrationForm };
