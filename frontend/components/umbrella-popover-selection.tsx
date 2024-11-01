import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Event } from "@/lib/gql/generated/graphql";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React, { useState } from "react";
import { useUmbrella } from "./providers";

interface UmbrellaPopoverSelectionProps {
  umbrellas: Event[];
  children: React.ReactNode;
}

export function UmbrellaPopoverSelection({
  umbrellas,
  children,
}: UmbrellaPopoverSelectionProps) {
  const { umbrellaID, setUmbrellaID } = useUmbrella();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Event suchen..." />
          <CommandList>
            <CommandEmpty>Kein Event gefunden.</CommandEmpty>
            <CommandGroup>
              {umbrellas.map((u) => (
                <CommandItem
                  key={u.ID}
                  value={u.title}
                  onSelect={() => {
                    setUmbrellaID(u.ID);
                    setIsOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      umbrellaID === u.ID ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {u.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
