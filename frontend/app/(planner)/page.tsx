import {CalendarOff} from "lucide-react";

export default function IndexPage() {
  return (
    <div className={'w-fill h-[60vh] flex flex-col gap-y-8 justify-center items-center text-center'}>
      <CalendarOff size={100} className={'flex-shrink-0'}/>
      Aktuell sind noch keine Veranstaltungen geplant.
    </div>
  )
}
