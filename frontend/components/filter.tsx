"use client";

import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

export default function Filter({
  title,
  options,
  filter,
  setFilter,
}: {
  title: string;
  options: string[];
  filter: string[];
  setFilter: React.Dispatch<React.SetStateAction<string[]>>;
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
      <div className="flex flex-row space-x-4">
        {options.map((o) => (
          <label key={o} className="flex items-center space-x-2">
            <Checkbox
              checked={filter.includes(o)}
              onCheckedChange={() => handleFilterChange(o)}
            />
            <p>{o}</p>
          </label>
        ))}
      </div>
    </div>
  );
}
