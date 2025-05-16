"use client";

import LoginForm from "@/components/login-form";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <LoginForm isRegistering={false} onSuccessAuth={() => router.push("/")} />
  );
}
