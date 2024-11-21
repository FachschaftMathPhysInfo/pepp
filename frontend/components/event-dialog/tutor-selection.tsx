"use client";

import { Button } from "@/components/ui/button";
import {
  EventToUserAssignment,
  EventTutorRoomPair,
  User,
} from "@/lib/gql/generated/graphql";
import {
  ChevronsUpDown,
} from "lucide-react";
import { useUmbrella } from "../providers";
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Checkbox } from "../ui/checkbox";

interface TutorSelectionProps {
  tutorial: EventTutorRoomPair | null;
  availableTutors: User[];
  setDeleteAssignments: React.Dispatch<
    React.SetStateAction<EventToUserAssignment[]>
  >;
  setNewAssignments: React.Dispatch<
    React.SetStateAction<EventToUserAssignment[]>
  >;
}

export function TutorSelection({
  tutorial,
  availableTutors,
  setDeleteAssignments,
  setNewAssignments,
}: TutorSelectionProps) {
  const { closeupID } = useUmbrella();

  const [open, setOpen] = useState(false);
  const [selectedTutors, setSelectedTutors] = useState(tutorial?.tutors);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit h-fit space-x-2"
        >
        {selectedTutors && selectedTutors.length > 0 ? (
          <div className="flex flex-col items-start">
            {selectedTutors?.map((t) => (
              <p key={t.mail}>
                {t.fn} {t.sn}
              </p>
            ))}
          </div>
        ) : (
          <p>Tutor wählen...</p>
        )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Name oder E-Mail..." />
          <CommandList>
            <CommandEmpty>Keine Ergebnisse.</CommandEmpty>
            <CommandGroup>
              {availableTutors.map((tutor) => {
                const isSelected = selectedTutors?.find(
                  (t) => t.mail === tutor.mail
                )
                  ? true
                  : false;
                const isOriginal = tutorial?.tutors.find(
                  (t) => t.mail === tutor.mail
                )
                  ? true
                  : false;
                const assignment: EventToUserAssignment = {
                  eventID: closeupID ?? 0,
                  userMail: tutor.mail,
                  roomNumber: tutorial?.room.number ?? "",
                  buildingID: tutorial?.room.building.ID ?? 0,
                };
                return (
                  <CommandItem
                    key={tutor.mail}
                    value={tutor.fn + " " + tutor.sn + tutor.mail}
                    onSelect={() => {
                      if (isSelected) {
                        setSelectedTutors((prev) =>
                          prev?.filter((t) => t.mail !== tutor.mail)
                        );

                        if (isOriginal) {
                          setDeleteAssignments((prev) => [...prev, assignment]);
                        } else {
                          setNewAssignments((prev) =>
                            prev.filter((a) => a !== assignment)
                          );
                        }
                      } else {
                        setSelectedTutors((prev) => [...prev ?? [], tutor]);

                        if (isOriginal) {
                          setDeleteAssignments((prev) =>
                            prev.filter((a) => a !== assignment)
                          );
                        } else {
                          setNewAssignments((prev) => [...prev, assignment]);
                        }
                      }
                    }}
                  >
                    <Checkbox className="mr-2" checked={isSelected} />
                    <div className="flex flex-col">
                      {tutor.fn + " " + tutor.sn}
                      <p className="text-xs text-muted-foreground">
                        {tutor.mail}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
