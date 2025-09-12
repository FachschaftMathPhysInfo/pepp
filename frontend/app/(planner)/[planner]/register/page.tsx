import {Metadata} from "next";
import RegisterForm from "./register-form";
import Modal from "@/components/modal";

export const metadata: Metadata = {
  title: 'Pepp - Stundenplan',
  description: 'Stundenplan des Vorkurses der Fachschaft MathPhysInfo',
  keywords: ['pepp', 'stundenplan', 'vorkurs', 'heidelberg', 'uni'],
}

export default function IndexPage() {
  return (
    <Modal>
      <RegisterForm modal={true}/>
    </Modal>
  );
}
