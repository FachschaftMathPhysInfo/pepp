import {Room, UpdateRoomMutation} from "@/lib/gql/generated/graphql";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import EditRoomForm from "@/app/(settings)/admin/rooms/edit-room-form";
import {Button} from "@/components/ui/button";
import React from "react";

interface EditRoomDialogProps {
  room: Room;
  isOpen : boolean;
  closeDialog: () => void;
}

export function EditRoomDialog( { room, isOpen, closeDialog}: EditRoomDialogProps ) {

  return(
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{room?.name} bearbeiten</DialogTitle>
        </DialogHeader>
        <EditRoomForm room={room} />
      </DialogContent>
      <DialogFooter>
        <div className={'w-full flex justify-between items-center pt-8'}>
          <Button onClick={() => closeDialog()} variant={"outline"}>Abbrechen</Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}