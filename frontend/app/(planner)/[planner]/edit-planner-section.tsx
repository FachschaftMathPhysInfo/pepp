import { DatePickerWithRange } from "@/components/date-picker-with-range";
import EditableTextfield from "@/components/editable-textfield";
import EventDialog from "@/components/event-dialog/event-dialog";
import { Button } from "@/components/ui/button";
import {
  Event,
  UmbrellaDetailDocument,
  UmbrellaDetailQuery,
  UmbrellaDetailQueryVariables,
} from "@/lib/gql/generated/graphql";
import { getClient } from "@/lib/graphql";
import { cn } from "@/lib/utils";
import { defaultEvent } from "@/types/defaults";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface EditPlannerSectionProps {
  umbrellaID: number;
}

export default function EditPlannerSection({
  umbrellaID,
}: EditPlannerSectionProps) {
  const [loading, setLoading] = useState(true);
  const [umbrella, setUmbrella] = useState<Event | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const client = getClient();

      const vars: UmbrellaDetailQueryVariables = {
        id: umbrellaID,
      };

      const umbrellaData = await client.request<UmbrellaDetailQuery>(
        UmbrellaDetailDocument,
        vars
      );

      setUmbrella({ ...defaultEvent, ...umbrellaData.umbrellas[0] });

      setLoading(false);
    };

    fetchData();
  }, [umbrellaID]);

  if (!umbrella) return;

  return (
    <>
      <EditableTextfield
        value={umbrella.title}
        edit={true}
        className="w-auto text-3xl font-semibold tracking-tight"
      />
      <div className="flex flex-row justify-between">
        <EventDialog modify={true}>
          <Button
            className={cn(
              "h-[40px] w-auto justify-start text-left font-normal"
            )}
          >
            <PlusCircle />
            Event hinzufügen
          </Button>
        </EventDialog>
        <DatePickerWithRange from={umbrella.from} to={umbrella.to} />
      </div>
    </>
  );
}
