import {
  Label,
  LabelKind,
  LabelsDocument,
  LabelsQuery,
  LabelsQueryVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getClient } from "@/lib/graphql";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface BadgePickerProps {
  kind: LabelKind;
  labelKindDescription?: string;
  selected: string | null;
  onChange: (label: string | null) => void;
}

export function BadgePicker({
  kind,
  labelKindDescription,
  selected,
  onChange,
}: BadgePickerProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (labels.length) return;
    const fetchData = async () => {
      const client = getClient();

      const vars: LabelsQueryVariables = {
        kind: kind,
      };

      const labelData = await client.request<LabelsQuery>(LabelsDocument, vars);

      setLabels(labelData.labels);
    };

    void fetchData();
  }, [kind, labels.length, open]);

  const sel = labels.find((label) => label.name === selected);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Badge
          variant="event"
          color={sel?.color ?? "grey"}
          className="space-x-2 hover:cursor-pointer"
        >
          {sel ? (
            <p>{sel.name}</p>
          ) : (
            <p>{labelKindDescription ?? "Label"} auswählen</p>
          )}
          <ChevronDown className="opacity-50 h-4 w-4" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Label..." />
          <CommandList>
            <CommandEmpty>Nichts gefunden.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => (
                <CommandItem
                  key={label.name}
                  value={label.name}
                  onSelect={() => {
                    onChange(label.name);
                    setOpen(false);
                  }}
                >
                  <div
                    className="rounded-full w-3 h-3 mr-2"
                    style={{ backgroundColor: label.color ?? "#FFFFFF" }}
                  />
                  {label.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      label === sel ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
