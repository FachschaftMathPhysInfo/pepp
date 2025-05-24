import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import React from "react";
import {Sprout} from "lucide-react";
import {Event} from "@/lib/gql/generated/graphql"
import EditUmbrellaForm from "@/app/(settings)/admin/umbrellas/edit-umbrella-form";

interface EditRoomDialogProps {
  umbrella: Event;
  umbrellas: Event[];
  isOpen : boolean;
  closeDialog: () => void;
  refreshTable: () => Promise<void>
  createMode: boolean;
}

export function EditUmbrellaDialog( { umbrella, umbrellas, isOpen, closeDialog, refreshTable, createMode = false}: EditRoomDialogProps ) {

  return(
    <Dialog open={isOpen}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <Sprout className={'inline mr-3'}/>
            {createMode ? "Programm erstellen" : "Programm bearbeiten"}
          </DialogTitle>
        </DialogHeader>
        <EditUmbrellaForm
          umbrella={umbrella}
          umbrellas={umbrellas}
          closeDialog={closeDialog}
          refreshTable={refreshTable}
          createMode={createMode}
        />
      </DialogContent>
    </Dialog>
  )
}