import { format } from "date-fns";
import { formatDateToHHMM } from "@/lib/utils";

interface FullDateDescriptionProps {
  from: Date;
  to: Date;
}

export function FullDateDescription({ from, to }: FullDateDescriptionProps) {
  return (
    <div>
      <span>
        {from.toLocaleString(undefined, { weekday: "long" })},{" "}
        {format(from, "PPP")}
      </span>
      <span>
        Von {formatDateToHHMM(from)} bis {formatDateToHHMM(to)}
      </span>
    </div>
  );
}
