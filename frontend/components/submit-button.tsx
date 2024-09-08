"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  label: string;
  loading: React.ReactNode;
};

const SubmitButton = ({ label, loading }: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={'mt-3'} disabled={pending}>
      {pending ? loading : label}
    </Button>
  );
};

export { SubmitButton };
