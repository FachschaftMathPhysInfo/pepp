import {Label, LabelKind,} from "@/lib/gql/generated/graphql";
import React, {useEffect, useState} from "react";
import {Check, ChevronDown, Edit} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";
import {Separator} from "./ui/separator";
import {Button} from "./ui/button";
import {useRouter} from "next/navigation";
import {useLabels} from "@/components/provider/labels-provider";

interface SingleBadgePickerProps {
  kind: LabelKind;
  labelKindDescription?: string;
  selected: number | null;
  onChange: (label: number | null) => void;
}

export function SingleBadgePicker({
                              kind,
                              labelKindDescription,
                              selected,
                              onChange,
                            }: SingleBadgePickerProps) {
  const {topicLabels, typeLabels} = useLabels()
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label>();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (kind === LabelKind.Topic) {
      setLabels(topicLabels)
      setSelectedLabel(topicLabels.find((label) => label.ID === selected))
    } else {
      setLabels(typeLabels)
      setSelectedLabel(typeLabels.find((label) => label.ID === selected))
    }
  }, [kind]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Badge
          variant="event"
          color={selectedLabel?.color ?? "grey"}
          className="space-x-2 hover:cursor-pointer"
        >
          {selectedLabel ? (
            <p>{selectedLabel.name}</p>
          ) : (
            <p>{labelKindDescription ?? "Label"} auswählen</p>
          )}
          <ChevronDown className="opacity-50 h-4 w-4"/>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 overflow-hidden">
        <Command>
          <CommandInput placeholder="Label..."/>
          <CommandList>
            <CommandEmpty>Nichts gefunden.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => (
                <CommandItem
                  key={label.name}
                  value={label.name}
                  onSelect={() => {
                    onChange(label.ID);
                    setOpen(false);
                  }}
                >
                  <div
                    className="rounded-full w-3 h-3 mr-2"
                    style={{backgroundColor: label.color ?? "#FFFFFF"}}
                  />
                  {label.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      label === selectedLabel ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <Separator/>
        <Button
          onClick={() => router.push("/admin/labels")}
          className="w-full rounded-none"
          variant={"ghost"}
        >
          <Edit/> Labels bearbeiten
        </Button>
      </PopoverContent>
    </Popover>
  );
}
