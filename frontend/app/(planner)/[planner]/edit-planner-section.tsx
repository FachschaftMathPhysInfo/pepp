import {Button} from "@/components/ui/button";
import {Event,} from "@/lib/gql/generated/graphql";
import {Edit2} from "lucide-react";
import {useState} from "react";
import {UmbrellaDialog} from "@/components/dialog/umbrellas/umbrella-dialog";

interface EditPlannerSectionProps {
  umbrella: Event;
  refreshData: () => Promise<void>;
}

export default function EditPlannerSection({ umbrella, refreshData }: EditPlannerSectionProps) {
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  if (!umbrella) return;

  return (
    <>
      <div className="flex flex-row space-x-2">
        <h1 className="text-3xl font-semibold">{umbrella.title}</h1>
        <Button variant={"ghost"} onClick={() => setEventDialogOpen(true)}>
          <Edit2/>
        </Button>
      </div>

      <UmbrellaDialog
        umbrella={umbrella}
        umbrellas={[umbrella]}
        isOpen={eventDialogOpen}
        closeDialog={() => setEventDialogOpen(false)}
        refreshTable={refreshData}
        createMode={false}
      />
    </>
  );
}
