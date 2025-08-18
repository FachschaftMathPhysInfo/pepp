import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import { cn } from '@/lib/utils';

interface ConfirmationDialogUnconditionalProps {
  description: string;
  isOpen: boolean;
  closeDialog: () => void;
}

type ConfirmationDialogConditionalProps =
    | {
  information: string;
  onConfirm?: never;
  mode: 'information';
}
    | {
  information?: never;
  onConfirm: () => Promise<void>;
  mode: 'confirmation';
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
              {props.mode === 'confirmation'
                  ? 'Bist du sicher?'
                  : props.information}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div
                className={cn(
                    'w-full flex items-center pt-8',
                    props.mode === 'confirmation' ? 'justify-between' : 'justify-end'
                )}
            >
              <Button
                  onClick={() => closeDialog()}
                  variant={props.mode === 'confirmation' ? 'outline' : 'default'}
              >
                {props.mode === 'confirmation' ? 'Abbrechen' : 'Verstanden'}
              </Button>
              {props.mode === 'confirmation' && (
                  <Button
                      onClick={async () => {
                        await props.onConfirm();
                        closeDialog();
                      }}
                      variant={'destructive'}
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