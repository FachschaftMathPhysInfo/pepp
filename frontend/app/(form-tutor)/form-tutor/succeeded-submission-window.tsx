import React from "react";
import {Button} from "@/components/ui/button";

interface SucceededSubmissionWindowProps {
  setSubmissionSuccess: React.Dispatch<React.SetStateAction<boolean>>
}

export function SuccceededSubmissionWindow( {setSubmissionSuccess}: SucceededSubmissionWindowProps) {

  return (
    <div className={'flex flex-col justify-center items-center'}>
    <h1>Success! Everything worked</h1>
    <Button onClick={ () => setSubmissionSuccess(false)}></Button>
    </div>
  )
}