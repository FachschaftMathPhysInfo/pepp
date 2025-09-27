"use client"

import RegisterForm from "./register-form";
import Modal from "@/components/modal";
import {usePathname, useRouter} from "next/navigation";


export default function IndexPage() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Modal onOpenChangeAction={() => {
      router.replace(pathname.replace(/\/register$/, ""));
      router.back();
    }}
    >
      <RegisterForm modal={true}/>
    </Modal>
  );
}
