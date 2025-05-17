import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button";
import React from "react";


interface InformationDialogProps {
  information: string,
  description: string,
  isOpen: boolean,
  closeDialog: () => void;
}

export default function InformationDialog( {information, description, isOpen, closeDialog }: InformationDialogProps ) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle className={'text-3xl mb-3'}>{information}</DialogTitle>
          <DialogDescription className={'text-lg'}>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className={'w-full flex justify-end items-center pt-8'}>
            <Button onClick={() => closeDialog()} variant={"default"}>Verstanden</Button>
          </div>
        </DialogFooter>
    </DialogContent>
  </Dialog>
  )

}