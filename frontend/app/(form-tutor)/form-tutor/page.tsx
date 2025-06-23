import TutorRegistrationForm from "@/app/(form-tutor)/form-tutor/tutor-registration-form";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Pepp - Tutori:innen Registrierung',
  description: 'Melde dich hier an, falls du bei Events aushelfen kannst',
  keywords: ['pepp', 'vorkurs', 'tutor', 'registrierung']
}

export default function TutorRegistration() {
  return (
    <div className={'min-h-[100vh] min-w-[100vw] pt-28 p-5 flex flex-col items-center justify-center'}>
      <TutorRegistrationForm />
    </div>
  )
}
