// See https://github.com/shadcn-ui/ui/blob/main/apps/www/app/(app)/examples/tasks/components/data-table-faceted-filter.tsx
import * as React from "react"
import {useEffect} from "react"
import {Check, PlusCircle} from "lucide-react"

import {cn} from "@/lib/utils"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import {Separator} from "@/components/ui/separator"

interface FacetedFilterProps {
  title?: string
  options: string[],
  setFilter: React.Dispatch<React.SetStateAction<string[]>>,
  className?: string
}

export function FacetedFilter({title, options, setFilter, className}: FacetedFilterProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<string[]>([])

  useEffect(() => {
    setFilter(selectedFilter)
  }, [selectedFilter])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle/>
          {title}
          {selectedFilter?.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4"/>
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedFilter.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedFilter.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedFilter.length} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedFilter.includes(option))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[200px] p-0", className)} align="start">
        <Command className={'h-full'}>
          <CommandInput placeholder={title}/>
          <CommandList>
            <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedFilter.includes(option)
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      const newFilters  = [...selectedFilter]
                      if (isSelected) {
                        const index = newFilters.indexOf(option)
                        if (index > -1) newFilters.splice(index, 1)
                      } else {
                        newFilters.push(option)
                      }
                      setSelectedFilter(newFilters)
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check/>
                    </div>
                    <span>{option}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedFilter.length > 0 && (
              <>
                <CommandSeparator/>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setSelectedFilter([])}
                    className="justify-center text-center"
                  >
                    Filter löschen
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}