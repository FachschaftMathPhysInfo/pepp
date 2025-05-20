import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import {cn} from "@/lib/utils";

export default function Filter({
  title,
  options,
  filter,
  setFilter,
  orientation = "row"
}: {
  title?: string;
  options: string[];
  filter: string[];
  setFilter: React.Dispatch<React.SetStateAction<string[]>>;
  orientation?: "row" | "column";
}) {
  const handleFilterChange = (f: string) => {
    setFilter((prevSelected) =>
      prevSelected.includes(f)
        ? prevSelected.filter((t) => t !== f)
        : [...prevSelected, f]
    );
  };

  return (
    <div>
      <p className="font-bold text-xs">{title}</p>
      <div
        className={cn("flex text-sm",
          orientation === "column" ? "flex-col justify-start items-start space-y-2" : "flex-row space-x-4")}
      >
        {options.map((o) => (
          <label
            key={o}
            className={"flex items-center space-x-4"}
          >
            <Checkbox
              checked={filter.includes(o)}
              onCheckedChange={() => handleFilterChange(o)}
              className={"mr-2"}
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}
