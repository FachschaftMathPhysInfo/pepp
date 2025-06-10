"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {useEffect} from "react";

interface DatePickerWithRangeProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  from?: Date;
  to?: Date;
  onClose?: (from: Date | undefined, to: Date | undefined) => void;
  modal?: boolean;
}

export function DatePickerWithRange({
  className,
  from,
  to,
  onClose,
  modal = false,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from ?? new Date(2022, 0, 20),
    to: to ?? addDays(new Date(2022, 0, 20), 20),
  });

  useEffect(() => {
    if (from && to) {
      setDate({ from, to });
    }
  }, [from, to]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover
        onOpenChange={(open) => {
          if (!open && onClose) {
            onClose(date?.from, date?.to);
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
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {/*For some reason these checks are needed, as when closing the umbrella dialog
            for one render a NaN is rendered, throwing an instant error*/}
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd. LLL y")} -{" "}
                  {format(date.to, "dd. LLL y")}
                </>
              ) : (
                format(date.from, "dd. LLL y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
