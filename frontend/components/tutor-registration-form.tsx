"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "./submit-button";
import { FieldError } from "./field-error";
import { EMPTY_FORM_STATE } from "@/lib/to-form-state";
import { addTutor } from "@/app/actions";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const EventTable = dynamic(() => import("@/app/form-tutor/ui/table/table"), {
  ssr: false,
});

const TutorRegistrationForm = () => {
  const inputDivStyling = "w-full my-3 ";
  const tableDivStyling = "my-10 w-full h-full";
  const [formState, action] = useFormState(addTutor, EMPTY_FORM_STATE);

  return (
    <form action={action} className="flex flex-col gap-y-2">
      <h1 className="text-center font-bold text-2xl">
        Anmeldung Vorkurstutor:in
      </h1>

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

      <SubmitButton label="Anmelden" loading="Bitte warten" />
    </form>
  );
};

export { TutorRegistrationForm };
