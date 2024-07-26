"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "./submit-button";
import { FieldError } from "./field-error";
import { EMPTY_FORM_STATE } from "@/lib/to-form-state";
import { addTutor } from "@/app/actions";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const EventTable = dynamic(() => import("@/app/form-tutor/ui/table/event-table"), {
  ssr: false,
});

const TutorRegistrationForm = () => {
  const inputDivStyling = "w-full my-1 grow-0";
  const tableDivStyling = "my-5 md:min-h-32 grow";
  const [formState, action] = useFormState(addTutor, EMPTY_FORM_STATE);

  return (
    <form action={action} className="flex flex-col w-[85%] md:w-[50%] xl:w-[35%] md:h-[calc(100vh-10rem)] mx-auto pb-3">
      <div className={inputDivStyling}>
        <Input type="text" name="fn" placeholder="Vorname" />
      </div>

      <div className={inputDivStyling}>
        <Input type="text" name="sn" placeholder="Nachname" />
      </div>

      <div className={inputDivStyling}>
        <Input type="email" name="email" placeholder="E-Mail" />
      </div>

      <div className={tableDivStyling}>
        <EventTable />
      </div>
      <FieldError formState={formState} name="text" />

      <SubmitButton label="Anmelden" loading="Bitte warten"/>
    </form>
  );
};

export { TutorRegistrationForm };
