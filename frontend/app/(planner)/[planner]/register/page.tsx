import {Metadata} from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: 'Pepp - Stundenplan',
  description: 'Stundenplan des Vorkurses der Fachschaft MathPhysInfo',
  keywords: ['pepp', 'stundenplan', 'vorkurs', 'heidelberg', 'uni'],
}

export default function IndexPage() {
  return (
    <RegisterForm/>
  );
}
