import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import {cn} from "@/lib/utils";

interface FilterProps {
  title?: string;
  options: string[];
  filter: string[];
  setFilter: React.Dispatch<React.SetStateAction<string[]>>;
  orientation?: "vertical" | "horizontal";
}

export default function Filter({
  title,
  options,
  filter,
  setFilter,
  orientation = "horizontal",
}: FilterProps) {
  const handleFilterChange = (filterOption: string) => {
    setFilter((prevSelected) =>
        prevSelected.includes(filterOption)
          ? prevSelected.filter((t) => t !== filterOption)
          : [...prevSelected, filterOption]
      );
  };

  return (
    <div>
      {title &&(
        <p className="font-bold text-xs">{title}</p>
      )}
      <p className={'text-muted-foreground mb-4'}>Nur folgende anzeigen:</p>
      <div className={cn('flex', orientation === "horizontal" ? "flex-row space-x-4" : "flex-col space-y-4")}>
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2">
            <Checkbox
              checked={filter.includes(option)}
              onCheckedChange={() => handleFilterChange(option)}
            />
            <p>{option}</p>
          </label>
        ))}
      </div>
    </div>
  );
}
