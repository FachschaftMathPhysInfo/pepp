import EventDialog from "@/components/event-dialog/event-dialog";

export default function PlannerEventModal({
  params,
}: {
  params: { planner: string; id: number };
}) {
  return <EventDialog id={params.id} />;
}
