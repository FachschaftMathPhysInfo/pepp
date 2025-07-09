"use client";

import {PlusCircle, Tags} from "lucide-react";
import {ManagementPageHeader} from "@/components/management-page-header";
import {Button} from "@/components/ui/button";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {useState} from "react";
import {Label} from "@/lib/gql/generated/graphql";
import {toast} from "sonner";
import LabelSection from "@/app/(settings)/admin/labels/label-section";

export type LabelDialogState = {
  mode: "add" | "edit" | "delete" | null;
  currentLabel?: Label;
}

export default function IndexPage() {
  const [dialogState, setDialogState] = useState<LabelDialogState>({mode: null});

  async function handleDelete() {
    toast.error('not yet implemented')
  }

  return (
    <section className="space-y-6">
      <ManagementPageHeader
        iconNode={<Tags />}
        title={"Labels"}
        description={
          "Hier kannst du die Label anpassen, welche deine Veranstaltungen bekommen. Beachte hierbei, dass diese entweder Veranstaltungstyp oder -thema beschreiben."
        }
        actionButton={
          <Button variant={"secondary"}>
            <PlusCircle/>
            Label erstellen
          </Button>
        }
      />

      <LabelSection setDialogState={setDialogState}/>

      <ConfirmationDialog
        isOpen={dialogState.mode === "delete"}
        mode={"confirmation"}
        description={`Dies wird das Label ${dialogState.currentLabel?.name} lïschen und von allen Events entfernen`}
        onConfirm={handleDelete}
        closeDialog={() => setDialogState({mode: null})}
      />

      {/*<LabelDialog*/}
      {/*  label={currentLabel.name}*/}
      {/*  mode={dialogState}*/}
      {/*  isOpen={dialogState === "edit" || dialogState === "add"}*/}
      {/*  closeDialog={() => setDialogState(null)}*/}
      {/*  refetch={() => {*/}
      {/*    return null*/}
      {/*  }}*/}
      {/*/>*/}
    </section>
  );
}
