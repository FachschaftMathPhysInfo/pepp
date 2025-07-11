"use client";

import Modal from "@/components/modal";
import RegisterForm from "../../register/register-form";

export default function Page() {
  return (
    <Modal>
      <RegisterForm modal={true} />
    </Modal>
  );
}
