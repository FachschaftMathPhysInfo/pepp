import {Building} from "@/lib/gql/generated/graphql";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import React from "react";
import {Sprout} from "lucide-react";
import BuildingForm from "@/app/(settings)/admin/locations/building-form";

interface BuildingDialogProps {
  currentBuilding: Building;
  isOpen : boolean;
  closeDialog: () => void;
  refreshTable: () => Promise<void>
  createMode: boolean;
}

export function BuildingDialog( {currentBuilding, isOpen, closeDialog, refreshTable, createMode = false}: BuildingDialogProps ) {

  return(
    <Dialog open={isOpen}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <Sprout className={'inline mr-3'}/>
            {createMode ? "Gebäude erstellen" : "Gebäude bearbeiten"}
          </DialogTitle>
        </DialogHeader>
        <BuildingForm
          currentBuilding={currentBuilding}
          closeDialog={closeDialog}
          refreshTable={refreshTable}
          createMode={createMode}
        />
      </DialogContent>
    </Dialog>
  )
}