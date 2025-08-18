import { format } from "date-fns";
import { formatDateToHHMM } from "@/lib/utils";

interface FullDateDescriptionProps {
  from: Date;
  to: Date;
}

export function FullDateDescription({ from, to }: FullDateDescriptionProps) {
  return (
    <div>
      <p>
        {from.toLocaleString(undefined, { weekday: "long" })},{" "}
        {format(from, "PPP")}
      </p>
      <p>
        Von {formatDateToHHMM(from)} bis {formatDateToHHMM(to)}
      </p>
    </div>
  );
}
