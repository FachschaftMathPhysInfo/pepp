import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button";
import React from "react";


interface ConfirmationDialogProps {
  description: string,
  onConfirm: () => Promise<void>,
  isOpen: boolean,
}

export default function ConfirmationDialog( {description, onConfirm, isOpen }: ConfirmationDialogProps ) {
  return (
    <Dialog open={isOpen}>
    <DialogContent>
      <DialogClose/>
      <DialogHeader>
        <DialogTitle>Bist du sicher?</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={() => onConfirm()}></Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )

}