import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ConfirmationDialogUnconditionalProps {
  description: string;
  isOpen: boolean;
  closeDialog: () => void;
}

type ConfirmationDialogConditionalProps =
  | {
      information: string;
      onConfirm?: never;
      mode: "information";
    }
  | {
      information?: never;
      onConfirm: () => Promise<void>;
      mode: "confirmation";
    }
  | {
      information?: never;
      onConfirm: () => Promise<void>;
      mode: "validation";
      accordionContent?: React.ReactNode;
    };

type ConfirmationDialogProps = ConfirmationDialogUnconditionalProps &
  ConfirmationDialogConditionalProps;

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { description, isOpen, closeDialog } = props;
  return (
    <Dialog open={isOpen}>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "information"
              ? props.information
              : "Bist du dir sicher?"}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {props.mode === "validation" && props.accordionContent}
        </DialogHeader>
        <DialogFooter>
          <div
            className={cn(
              "w-full flex items-center pt-8",
              props.mode === "confirmation" ? "justify-between" : "justify-end"
            )}
          >
            <Button
              onClick={() => closeDialog()}
              variant={props.mode === "confirmation" ? "outline" : "default"}
            >
              {props.mode === "confirmation" ? "Abbrechen" : "Verstanden"}
            </Button>
            {props.mode === "confirmation" && (
              <Button
                onClick={async () => {
                  await props.onConfirm();
                  closeDialog();
                }}
                variant={"destructive"}
              >
                Bestätigen
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
