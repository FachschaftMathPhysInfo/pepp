import {Building, Room} from "@/lib/gql/generated/graphql";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import RoomForm from "@/app/(settings)/admin/locations/room-form";
import React from "react";
import {Sprout} from "lucide-react";

interface RoomDialogProps {
  room: Room;
  currentBuilding: Building;
  buildings: Building[];
  isOpen : boolean;
  closeDialog: () => void;
  refreshTable: () => Promise<void>
  createMode: boolean;
}

export function RoomDialog({ room, currentBuilding, buildings, isOpen, closeDialog, refreshTable, createMode = false}: RoomDialogProps ) {

  return(
    <Dialog open={isOpen}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <Sprout className={'inline mr-3'}/>
            {createMode ? "Raum erstellen" : "Raum bearbeiten"}
          </DialogTitle>
        </DialogHeader>
        <RoomForm
          room={room}
          currentBuilding={currentBuilding}
          buildings={buildings}
          closeDialog={closeDialog}
          refreshTable={refreshTable}
          createMode={createMode}
        />
      </DialogContent>
    </Dialog>
  )
}