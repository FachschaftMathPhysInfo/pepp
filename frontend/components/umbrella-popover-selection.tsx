import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Event} from "@/lib/gql/generated/graphql";
import {cn, extractId, slugify} from "@/lib/utils";
import {Check, ChevronsUpDown} from "lucide-react";
import React, {useState} from "react";
import {Button} from "./ui/button";
import {usePathname, useRouter} from "next/navigation";

interface UmbrellaPopoverSelectionProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  umbrellas: Event[];
  heading?: boolean;
}

export function UmbrellaPopoverSelection({
                                           umbrellas,
                                           className
                                         }: UmbrellaPopoverSelectionProps) {
  const pathname = usePathname()
  const router = useRouter()
  const umbrellaID = extractId(pathname)
  const [isOpen, setIsOpen] = useState(false);

  const buttonText = umbrellas.find((u) => u.ID == umbrellaID)?.title ?? "Event auswählen..."

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className={'p-6 w-fit'}>
        <Button
          variant="outline"
          role="combobox"
          title={buttonText}
          className={cn('px-4', className)}
        >
          <span className={'truncate'}>{buttonText}</span>
          <ChevronsUpDown className="h-7 w-7 shrink-0 opacity-40"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Event suchen..."/>
          <CommandList>
            <CommandEmpty>Kein Event gefunden.</CommandEmpty>
            <CommandGroup>
              {umbrellas.map((u) => (
                <CommandItem
                  key={u.ID}
                  value={u.title}
                  onSelect={() => {
                    router.push("/" + slugify(u.title) + "-" + u.ID)
                    setIsOpen(false);
                  }}
                  title={u.title}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 flex-shrink-0",
                      umbrellaID === u.ID ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className={'truncate'}>{u.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
