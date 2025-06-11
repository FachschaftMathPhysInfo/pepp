import { useState } from "react";
import { Switch } from "./ui/switch";

interface SwitchCardProps {
  children?: React.ReactNode;
  initiallyChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description?: string;
}

export function SwitchCard({
  children,
  initiallyChecked,
  onCheckedChange,
  title,
  description,
}: SwitchCardProps) {
  const [checked, setChecked] = useState(initiallyChecked);
  return (
    <div className="rounded-lg border p-3 shadow-sm space-y-4">
      <div className="flex flex-row justify-between items-center">
        <div className="space-y-0.5">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={(c) => {
            setChecked(c);
            onCheckedChange(c);
          }}
        />
      </div>
      {children}
    </div>
  );
}
