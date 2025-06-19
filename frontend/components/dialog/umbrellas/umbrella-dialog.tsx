import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import React from "react";
import {Sprout} from "lucide-react";
import {Event} from "@/lib/gql/generated/graphql"
import EditUmbrellaForm from "@/components/dialog/umbrellas/edit-umbrella-form";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import CopyUmbrellaForm from "@/components/dialog/umbrellas/copy-umbrella-form";

interface EditRoomDialogProps {
  umbrella: Event;
  umbrellas: Event[];
  isOpen : boolean;
  closeDialog: () => void;
  refreshTable: () => Promise<void>
  createMode: boolean;
}

export function UmbrellaDialog({ umbrella, umbrellas, isOpen, closeDialog, refreshTable, createMode = false}: EditRoomDialogProps ) {

  return(
    <Dialog open={isOpen}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <Sprout className={'inline mr-3'}/>
            {createMode ? "Programm erstellen" : "Programm bearbeiten"}
          </DialogTitle>
        </DialogHeader>
        {createMode ? (
          <Tabs defaultValue="blank" className="w-full">
            <TabsList className={'w-full flex mb-4'}>
              <TabsTrigger value="blank" className={'flex-grow'}>Neu</TabsTrigger>
              <TabsTrigger value="copy" className={'flex-grow'}>Aus Vorlage</TabsTrigger>
            </TabsList>
            <TabsContent value="blank">
              <EditUmbrellaForm
                umbrella={umbrella}
                closeDialog={closeDialog}
                refreshTable={refreshTable}
                createMode={createMode}
              />
            </TabsContent>
            <TabsContent value="copy">
              <CopyUmbrellaForm
                umbrellas={umbrellas}
                closeDialog={closeDialog}
                refreshTable={refreshTable}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <EditUmbrellaForm
            umbrella={umbrella}
            closeDialog={closeDialog}
            refreshTable={refreshTable}
            createMode={createMode}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}