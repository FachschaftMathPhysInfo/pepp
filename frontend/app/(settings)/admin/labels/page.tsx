"use client";

import {PlusCircle, Tags} from "lucide-react";
import {ManagementPageHeader} from "@/components/management-page-header";
import {Button} from "@/components/ui/button";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {useState} from "react";
import {DeleteLabelDocument, DeleteLabelMutation, Label,} from "@/lib/gql/generated/graphql";
import {toast} from "sonner";
import {getClient} from "@/lib/graphql";
import {LabelTable} from "@/components/tables/label-table/label-table";
import {Skeleton} from "@/components/ui/skeleton";
import {LabelDialog} from "@/components/dialog/labels/label-dialog";
import {defaultLabel} from "@/types/defaults";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {useUser} from "@/components/provider/user-provider";
import {useLabels} from "@/components/provider/labels-provider";

export type LabelDialogState = {
  mode: "add" | "edit" | "delete" | null;
  currentLabel?: Label;
}

export default function LabelSettingsPage() {
  const {sid} = useUser()
  const [dialogState, setDialogState] = useState<LabelDialogState>({mode: null});
  const [loading, setLoading] = useState(false);
  const {topicLabels, typeLabels, triggerLabelRefetch} = useLabels()

  async function handleDelete() {
    setLoading(true);
    const client = getClient(String(sid))

    try {
      await client.request<DeleteLabelMutation>(DeleteLabelDocument, {
        id: [dialogState.currentLabel?.ID]
      })

      toast.success(`Label ${dialogState.currentLabel?.name} wurde gelöscht!`)
      void triggerLabelRefetch()
    } catch {
      toast.error('Label konnte nicht gelöscht werden')
    }
    setLoading(false);
  }

  return (
    <section className="space-y-6">
      <ManagementPageHeader
        iconNode={<Tags/>}
        title={"Labels"}
        description={
          "Hier kannst du die Label anpassen, welche deine Veranstaltungen bekommen. Beachte hierbei, dass diese entweder Veranstaltungstyp oder -thema beschreiben."
        }
        actionButton={
          <Button
            variant={"secondary"}
            onClick={() => setDialogState({mode: "add"})}
          >
            <PlusCircle/>
            Label erstellen
          </Button>
        }
      />

      {loading ? (
        <div className={'w-full relative'}>
          <Skeleton className={'w-full h-[300px]'}/>
          <p className={'top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'}>Lade Labels...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent>
              <CardHeader className={'text-xl font-bold pl-0'}>Event Themen</CardHeader>
              <LabelTable
                data={topicLabels}
                setDialogState={setDialogState}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <CardHeader className={'text-xl font-bold pl-0'}>Event Art</CardHeader>
              <LabelTable
                data={typeLabels}
                setDialogState={setDialogState}
              />
            </CardContent>
          </Card>

        </>

      )}

      <ConfirmationDialog
        isOpen={dialogState.mode === "delete"}
        mode={"confirmation"}
        description={`Dies wird das Label ${dialogState.currentLabel?.name} lïschen und von allen Events entfernen`}
        onConfirm={handleDelete}
        closeDialog={() => setDialogState({mode: null})}
      />

      <LabelDialog
        label={dialogState.currentLabel ?? defaultLabel}
        isOpen={dialogState.mode === "edit" || dialogState.mode === "add"}
        closeDialog={() => setDialogState({mode: null})}
        mode={dialogState.mode === "add" || dialogState.mode === "edit" ? dialogState.mode : null}
      />
    </section>
  );
}
