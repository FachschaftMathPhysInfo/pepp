import {Room} from "@/lib/gql/generated/graphql";
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import EditRoomForm from "@/app/(settings)/admin/rooms/edit-room-form";
import React from "react";
import {Sprout} from "lucide-react";

interface EditRoomDialogProps {
  room: Room;
  isOpen : boolean;
  closeDialog: () => void;
}

export function EditRoomDialog( { room, isOpen, closeDialog}: EditRoomDialogProps ) {

  return(
    <Dialog open={isOpen}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <Sprout className={'inline mr-3'}/>
            Raum bearbeiten
          </DialogTitle>
        </DialogHeader>
        <EditRoomForm room={room} closeDialog={closeDialog}/>
      </DialogContent>
    </Dialog>
  )
}