import React, { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { ReactNode } from "react";

type Mode = "auto" | "hover" | "touch";

type AdaptiveHoverCardPopoverProps = {
  trigger: ReactNode;
  content: ReactNode;
  id?: string;
  contentClassName?: string;
  triggerClassName?: string;
  forceMode?: Mode;
  closeOnSelect?: boolean;
};

export default function AdaptiveHoverCardPopover({
  trigger,
  content,
  id,
  contentClassName,
  triggerClassName,
  forceMode = "auto",
}: AdaptiveHoverCardPopoverProps) {
  const [hoverCapable, setHoverCapable] = useState<boolean | null>(null);

  useEffect(() => {
    if (forceMode === "hover") {
      setHoverCapable(true);
      return;
    }
    if (forceMode === "touch") {
      setHoverCapable(false);
      return;
    }

    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      setHoverCapable(false);
      return;
    }

    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setHoverCapable(!!mq.matches);

    const handler = (e: MediaQueryListEvent) => setHoverCapable(!!e.matches);
    if ("addEventListener" in mq) {
      mq.addEventListener("change", handler);
    } else {
      // fallback for older browsers
      // @ts-ignore
      mq.addListener(handler);
    }
    return () => {
      if ("removeEventListener" in mq) {
        mq.removeEventListener("change", handler);
      } else {
        // @ts-ignore
        mq.removeListener(handler);
      }
    };
  }, [forceMode]);

  if (hoverCapable === null) return null;

  if (hoverCapable) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <span className={triggerClassName} aria-describedby={id}>
            {trigger}
          </span>
        </HoverCardTrigger>

        <HoverCardContent
          side="top"
          align="center"
          className={contentClassName}
          id={id}
        >
          {content}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          aria-haspopup="dialog"
          aria-expanded={false}
          aria-controls={id}
        >
          {trigger}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className={contentClassName}
        id={id}
      >
        {content}
        <div className="sr-only" aria-hidden>
          Tap outside or press Escape to close.
        </div>
      </PopoverContent>
    </Popover>
  );
}
