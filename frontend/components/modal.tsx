"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";

export default function Modal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <>
      <Dialog defaultOpen={true} open={true} onOpenChange={() => router.back()}>
        <DialogContent className={cn("sm:min-w-[600px]", className)}>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
