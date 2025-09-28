import React, { useState } from "react";
import { Button } from "./ui/button";
import { Check, Copy, CopyCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CopyTextAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  text: string;
}

export function CopyTextArea({ label, text, className }: CopyTextAreaProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-2 flex w-[300px] items-center gap-x-2",
        className
      )}
    >
      <div className="truncate justify-center h-full flex flex-col">
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <Tooltip>
          <TooltipTrigger>
            <p className="text-sm truncate">{text}</p>
          </TooltipTrigger>
          <TooltipContent>{text}</TooltipContent>
        </Tooltip>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => handleCopy()}
            variant="secondary"
            size="icon"
            className={"shrink-0"}
          >
            {isCopied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isCopied ? "Kopiert!" : "In Zwischenablage kopieren"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
