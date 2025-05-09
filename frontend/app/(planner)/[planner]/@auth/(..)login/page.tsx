"use client";

import LoginForm from "@/components/login-form";
import Modal from "@/components/modal";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function Page() {
  const [isRegistering, setIsRegistering] = useState(false);
  return (
    <Modal>
      <DialogHeader>
        <DialogTitle>{isRegistering ? "Registrieren" : "Anmelden"}</DialogTitle>
        <DialogDescription>
          <span>{isRegistering ? "Zurück zur" : "Noch kein Konto?"} </span>
          <span
            onClick={() => setIsRegistering(isRegistering ? false : true)}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {isRegistering ? "Anmeldung" : "Registrieren"}
          </span>
        </DialogDescription>
      </DialogHeader>
      <LoginForm isRegistering={isRegistering} />
    </Modal>
  );
}
