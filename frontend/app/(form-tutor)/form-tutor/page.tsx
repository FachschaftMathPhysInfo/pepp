"use client";

import {useState} from "react";
import TutorRegistrationForm from "@/app/(form-tutor)/form-tutor/tutor-registration-form";
import {SuccceededSubmissionWindow} from "@/app/(form-tutor)/form-tutor/succeeded-submission-window";

export default function TutorRegistration() {
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false)

  return (
    <div className={'min-h-[100vh] min-w-[100vw] pt-28 p-5 flex flex-col items-center justify-center'}>
    {(!submissionSuccess) ? (
      <TutorRegistrationForm setSubmissionSuccess={setSubmissionSuccess} />
    ) : (
      <SuccceededSubmissionWindow setSubmissionSuccess={setSubmissionSuccess} />
    )}
    </div>
  )
}
