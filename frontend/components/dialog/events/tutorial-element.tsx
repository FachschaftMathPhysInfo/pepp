import {Tutorial} from "@/lib/gql/generated/graphql";
import {Building, DoorClosed} from "lucide-react";

interface TutorialElementProps {
  tutorial: Tutorial;
}

export default function TutorialElement({tutorial}: TutorialElementProps) {
  return (
    <div className={'w-full flex items-center justify-between px-2 py-6 text-muted-foreground'}>
      <span>{(tutorial.tutors || [])[0]?.fn ?? "Noch keine Tutor:innen"} {(tutorial.tutors || [])[0]?.sn}</span>
      <span className={'flex items-center gap-2'}><Building size={18}/> {tutorial.room.building.name}</span>
      <span className={'flex items-center gap-2'}><DoorClosed size={18}/> {tutorial.room.name}</span>
    </div>
  )
}