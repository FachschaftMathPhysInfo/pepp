"use client";

import Modal from "@/components/modal";
import RegisterForm from "../../register/register-form";
import {usePathname, useRouter} from "next/navigation";

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Modal onOpenChangeAction={() => router.replace(pathname.replace(/\/register$/,""))}>
      <RegisterForm modal={true} />
    </Modal>
  );
}
