import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DatePickerProps {
  selected: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}

export function DatePicker({ selected, onChange, disabled = () => false }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] pl-3 text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          {selected ? format(selected, "PPP") : <span>Datum auswählen</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            setOpen(false);
            onChange(date);
          }}
          disabled={disabled}
          initialFocus
          defaultMonth={selected}
        />
      </PopoverContent>
    </Popover>
  );
}
