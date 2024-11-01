import { useState } from "react";
import { Button } from "./ui/button";
import { Copy, CopyCheck } from "lucide-react";

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
    <div className="relative border rounded-lg p-2 flex flex-row min-w-[300px] overflow-hidden">
      <div>
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <p className="text-sm truncate">{text}</p>
      </div>
      <Button
        onClick={() => handleCopy()}
        className="absolute right-2"
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
