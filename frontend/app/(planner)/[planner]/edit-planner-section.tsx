"use client";

import EventDialog from "@/components/event-dialog/event-dialog";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {
  Event,
  UmbrellaDetailDocument,
  UmbrellaDetailQuery,
  UmbrellaDetailQueryVariables,
} from "@/lib/gql/generated/graphql";
import {cn} from "@/lib/utils";
import {Edit3, PlusCircle} from "lucide-react";
import {useEffect, useState} from "react";
import EditPlannerForm from "@/app/(planner)/[planner]/edit-planner-form";
import {getClient} from "@/lib/graphql";
import {defaultEvent} from "@/types/defaults";


interface EditPlannerSectionProps {
  umbrellaID: number;
}

export default function EditPlannerSection({
  umbrellaID,
}: EditPlannerSectionProps) {

  const [umbrella, setUmbrella] = useState<Event | null>(null);
  const [open, setOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {

      const client = getClient();

      const vars: UmbrellaDetailQueryVariables = {
        id: umbrellaID,
      };

      const umbrellaData = await client.request<UmbrellaDetailQuery>(
        UmbrellaDetailDocument,
        vars
      );

      setUmbrella({ ...defaultEvent, ...umbrellaData.umbrellas[0] });


    };

    void fetchData();
  }, [umbrellaID]);

  if (!umbrella) return;

  return (
      <div className="flex flex-row space-x-2">
        <h1 className="text-3xl font-semibold">{umbrella.title}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost">
              <Edit3 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w[425px]">
            <DialogHeader>
              <DialogTitle>Veranstaltung bearbeiten</DialogTitle>
            </DialogHeader>
            <EditPlannerForm
              umbrellaID={umbrellaID}
              umbrella={umbrella}
              setUmbrella={setUmbrella}
              closeDialog={() =>  setOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
          <EventDialog open={eventDialogOpen} modify={true} />
        </Dialog>
        <Button
          variant={"secondary"}
          className={cn("h-[40px] w-auto justify-start text-left font-normal")}
          onClick={() => setEventDialogOpen(true)}
        >
          <PlusCircle />
          Event hinzufügen
        </Button>
      </div>
  );
}
