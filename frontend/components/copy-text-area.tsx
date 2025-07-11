import { useState } from "react";
import { Button } from "./ui/button";
import { Copy, CopyCheck } from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

interface CopyTextAreaProps {
  label?: string;
  text: string;
}

export function CopyTextArea({ label, text }: CopyTextAreaProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("failed to copy text:", err);
    }
  };

  return (
    <div className="border rounded-lg p-2 flex w-[300px] justify-between items-end overflow-hidden gap-x-6">
      <div className={'truncate'}>
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <Tooltip>
          <TooltipTrigger>
            <p className="text-sm truncate">{text}</p>
          </TooltipTrigger>
          <TooltipContent>
            {text}
          </TooltipContent>
        </Tooltip>
      </div>
      <Button
        onClick={() => handleCopy()}
        variant="secondary"
        size="icon"
      >
        {isCopied ? (
          <CopyCheck className="h-5 w-5" />
        ) : (
          <Copy className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
