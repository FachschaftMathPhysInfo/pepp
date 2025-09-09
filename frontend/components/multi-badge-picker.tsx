import {Label, LabelKind, LabelsDocument, LabelsQuery, LabelsQueryVariables,} from "@/lib/gql/generated/graphql";
import React, {useEffect, useState} from "react";
import {Check, ChevronDown, Edit, Save} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {getClient} from "@/lib/graphql";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";
import {Separator} from "./ui/separator";
import {Button} from "./ui/button";
import {useRouter} from "next/navigation";

interface MultiBadgePickerProps {
  kind: LabelKind;
  labelKindDescription?: string;
  selectedLabelIDs: number[];
  onChange: (labels: Label[]) => void;
}

export function MultiBadgePicker({
                                    kind,
                                    labelKindDescription,
                                    selectedLabelIDs,
                                    onChange,
                                  }: MultiBadgePickerProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(
    labels.filter((label) => selectedLabelIDs?.includes(label.ID)) ?? []
  )
  const [open, setOpen] = useState(false);
  const router = useRouter();

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

  function handleOnSave() {
    onChange(selectedLabels)
    setOpen(false);
  }

  console.log(selectedLabels)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        {selectedLabels.length ? (
          selectedLabels.map((label) => (
            <Badge
              variant="event"
              color={label.color}
              className="space-x-2 hover:cursor-pointer"
            >
              {label.name}
              <ChevronDown className="opacity-50 h-4 w-4"/>
            </Badge>
          ))
        ) : (
          <Badge
            variant="event"
            color={"grey"}
            className="space-x-2 hover:cursor-pointer"
          >
            {labelKindDescription ?? "Label"} auswählen
            <ChevronDown className="opacity-50 h-4 w-4"/>
          </Badge>
        )}
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
                    if (selectedLabels.map(l => l.ID).includes(label.ID)) {
                      setSelectedLabels(selectedLabels.filter(l => l.ID !== label.ID));
                    } else {
                      setSelectedLabels(({...selectedLabels, ...label}));
                    }
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
                      selectedLabels.map(l => l.ID).includes(label.ID)
                        ? "opacity-100"
                        : "opacity-0"
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
        <Button className={'w-full'} onClick={handleOnSave}>
          <Save/> Speichern
        </Button>
      </PopoverContent>
    </Popover>
  );
}
