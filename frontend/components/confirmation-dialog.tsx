import {
  Dialog,
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
  closeDialog: () => void;
}

export default function ConfirmationDialog( {description, onConfirm, isOpen, closeDialog }: ConfirmationDialogProps ) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle className={'text-3xl mb-3'}>Bist du sicher?</DialogTitle>
          <DialogDescription className={'text-lg'}>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className={'w-full flex justify-between items-center pt-8'}>
            <Button onClick={() => closeDialog()} variant={"outline"}>Abbrechen</Button>
            <Button
              onClick={async () => {
                await onConfirm()
                closeDialog()
              }}
              variant={"destructive"}
            >
              Bestätigen</Button>
          </div>
        </DialogFooter>
    </DialogContent>
  </Dialog>
  )

}