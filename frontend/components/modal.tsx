"use client";

import {useRouter} from "next/navigation";
import {Dialog, DialogContent} from "./ui/dialog";
import {cn} from "@/lib/utils";
import React from "react";

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  onOpenChangeAction?: (open?: boolean) => void;
}

export default function Modal({children, className, onOpenChangeAction}: ModalProps) {
  const router = useRouter();

  return (
    <>
      <Dialog
        defaultOpen
        open
        onOpenChange={() => {
          if (onOpenChangeAction) onOpenChangeAction();
          else router.back()
        }}
      >
        <DialogContent className={cn("sm:min-w-[600px]", className)}>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
