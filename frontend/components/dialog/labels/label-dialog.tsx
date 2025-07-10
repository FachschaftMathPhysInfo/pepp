import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import React from "react";
import {Sprout} from "lucide-react";
import {Label} from "@/lib/gql/generated/graphql"
import LabelForm from "@/components/dialog/labels/label-form";

interface LabelDialogProps {
  label: Label;
  isOpen: boolean;
  closeDialog: () => void;
  mode: "add" | "edit" | null;
  triggerRefetch: () => Promise<void>;
}

export function LabelDialog(props: LabelDialogProps) {
  const createMode = props.mode === "add"

  return (
    <Dialog open={props.isOpen}>
      <DialogContent className="[&>button]:hidden rounded-lg max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            <Sprout className={'inline mr-3'}/>
            {createMode ? "Label erstellen" : "Label bearbeiten"}
          </DialogTitle>
        </DialogHeader>

        <LabelForm
          mode={props.mode}
          label={props.label}
          closeDialog={props.closeDialog}
          triggerRefetch={props.triggerRefetch}
        />
      </  DialogContent>
    </Dialog>
  )
}
