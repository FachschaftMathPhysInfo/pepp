import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn, formatDate, getDateAdjustedForTimezone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  initialDateFrom?: Date | string;
  initialDateTo?: Date | string;
  onClose?: (from: Date | undefined, to: Date | undefined) => void;
  modal?: boolean;
}

interface DateRange {
  from: Date;
  to: Date | undefined;
}

export function DatePickerWithRange({
  className,
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  onClose,
  modal = false,
}: DatePickerWithRangeProps) {
  const [range, setRange] = React.useState<DateRange>({
    from: getDateAdjustedForTimezone(initialDateFrom),
    to: initialDateTo
      ? getDateAdjustedForTimezone(initialDateTo)
      : getDateAdjustedForTimezone(initialDateFrom),
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover
        onOpenChange={(open) => {
          if (!open && onClose) {
            onClose(range.from, range.to);
          }
        }}
        modal={modal}
      >
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !range && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {initialDateFrom ? (
              <>
                {`${formatDate(range.from, "de")}${
                  range.to != null ? " - " + formatDate(range.to, "de") : ""
                }`}
              </>
            ) : (
              <span>Wähle ein Datum</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range.from}
            selected={range}
            onSelect={(value: { from?: Date; to?: Date } | undefined) => {
              if (value?.from != null) {
                setRange({ from: value.from, to: value?.to });
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
