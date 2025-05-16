"use client";

import LoginForm from "@/components/login-form";
import Modal from "@/components/modal";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {useRouter} from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter()
  return (
    <Modal>
      <DialogHeader>
        <DialogTitle>{isRegistering ? "Registrieren" : "Anmelden"}</DialogTitle>
        <DialogDescription>
          <span>{isRegistering ? "Zurück zur" : "Noch kein Konto?"} </span>
          <span
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {isRegistering ? "Anmeldung" : "Registrieren"}
          </span>
        </DialogDescription>
      </DialogHeader>
      <LoginForm isRegistering={isRegistering} onSuccessAuth={() => router.back()} />
    </Modal>
  );
}
