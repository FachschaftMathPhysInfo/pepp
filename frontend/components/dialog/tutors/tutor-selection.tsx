import { Button } from "@/components/ui/button";
import { User } from "@/lib/gql/generated/graphql";
import { ChevronsUpDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Checkbox } from "../../ui/checkbox";

interface TutorSelectionProps {
  selectedTutors?: User[];
  onSelectedTutorsChange: (tutor: User) => void;
  availableTutors: User[];
}

export function TutorSelection({
  selectedTutors,
  onSelectedTutorsChange,
  availableTutors,
}: TutorSelectionProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(selectedTutors ?? []);

  useEffect(() => {
    setSelected(selectedTutors ?? []);
  }, [selectedTutors]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit h-fit space-x-2"
        >
          {selected.length > 0 ? (
            <div className="flex flex-col items-start">
              {selected.map((t) => (
                <p key={t.mail}>
                  {t.fn} {t.sn}
                </p>
              ))}
            </div>
          ) : (
            <p>Tutor/in wählen...</p>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Name oder E-Mail..." />
          <CommandList>
            <CommandEmpty>Niemanden gefunden.</CommandEmpty>
            <CommandGroup>
              {availableTutors.map((tutor) => {
                const isSelected = !!selected.find((t) => t.mail === tutor.mail);
                return (
                  <CommandItem
                    key={tutor.mail}
                    value={tutor.fn + " " + tutor.sn + tutor.mail}
                    onSelect={() => {
                      onSelectedTutorsChange(tutor);

                      if (isSelected) {
                        setSelected((prev) =>
                          prev.filter((t) => t.mail !== tutor.mail)
                        );
                      } else {
                        setSelected((prev) => [...prev, tutor]);
                      }
                    }}
                  >
                    <Checkbox className="mr-2" checked={isSelected} />
                    <div className="flex flex-col">
                      {tutor.fn + " " + tutor.sn}
                      <p className="text-xs text-muted-foreground">
                        {tutor.mail}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
