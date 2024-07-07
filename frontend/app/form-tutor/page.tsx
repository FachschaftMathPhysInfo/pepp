import { Header } from "@/components/header";
import {TutorRegistrationForm} from "@/components/tutor-registration-form";

export default function Page() {
  return (
    <div className="w-full h-full">
      <Header></Header>
      <div className="w-fit mx-auto p-10">
        <TutorRegistrationForm />
      </div>
    </div>
  );
}
