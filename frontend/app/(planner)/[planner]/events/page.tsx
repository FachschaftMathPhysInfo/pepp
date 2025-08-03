import {extractId} from "@/lib/utils";
import EventsOverviewPage from "@/app/(planner)/[planner]/events/events-overview-page";

interface EventsOverviewPageWrapperProps {
  params: Promise<{ planner: string }>
}

export default async function EventsOverviewPageWrapper(props: EventsOverviewPageWrapperProps) {
  const {planner} = await props.params
  const umbrellaID = extractId(planner)

  if (!umbrellaID) return null;

  return (
    <EventsOverviewPage umbrellaID={umbrellaID}/>
  )
}