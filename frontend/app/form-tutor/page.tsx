import {TutorRegistrationForm} from "@/components/tutor-registration-form";

export default function Page() {
  return (
    <div className="w-full h-full">
      <div className="w-full mt-3">
        <h1 className="text-center font-bold text-2xl mb-2"> Anmeldung Vorkurstutor:in </h1>
        <TutorRegistrationForm/>
      </div>
    </div>
  );
}
