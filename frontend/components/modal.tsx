"use client";

import {Dialog, DialogContent} from "./ui/dialog";
import {cn} from "@/lib/utils";
import React from "react";

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  onOpenChangeAction: (open?: boolean) => void;
}

export default function Modal({children, className, onOpenChangeAction}: ModalProps) {
  return (
    <>
      <Dialog
        open
        onOpenChange={onOpenChangeAction}
      >
        <DialogContent className={cn("sm:min-w-[600px]", className)}>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
