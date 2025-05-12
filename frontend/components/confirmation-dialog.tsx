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
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ConfirmationDialog( {description, onConfirm, isOpen, setIsOpen }: ConfirmationDialogProps ) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Bist du sicher?</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className={'w-full flex justify-between items-center pt-8'}>
            <Button onClick={() => {setIsOpen(false)}} variant={"outline"}>Abbrechen</Button>
            <Button
              onClick={async () => {
                await onConfirm()
                setIsOpen(false)
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