import React from "react";
import Image from "next/image";

interface SucceededSubmissionWindowProps {
  userMail: string;
}

export function SuccceededSubmissionWindow({userMail}: SucceededSubmissionWindowProps) {
  const formattedMail: string = userMail.replace(/([.@])/g, "$1\u200B")

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto p-12 rounded-lg border">
      <Image
        className="mb-6"
        src={'check_circle.svg'}
        alt="Checkmark in a circle"
        width={150}
        height={150}
      />
      <h1 className="text-4xl font-bold mb-4 text-center">Erfolgreich Registriert!</h1>
      <div className="text-center max-w-full space-y-2">
        <p className="text-lg">
          In Kürze schicken wir eine E-Mail an
        </p>
        <div className="text-2xl font-semibold text-green-500 break-words">
          {formattedMail}
        </div>
        <p className="text-lg">
          In dieser bekommst du einen Login-Link, mit welchem du dich dann in diesem System anmelden kannst.
          Wir freuen uns auf eine gute Zusammenarbeit!
        </p>
      </div>
    </div>
  );
}
