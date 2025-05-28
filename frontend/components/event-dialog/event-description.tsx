import { Event } from "@/lib/gql/generated/graphql";
import { Badge } from "../ui/badge";
import { FullDateDescription } from "../full-date-description";

interface EventDescriptionProps {
  event: Event | undefined;
}

export default function EventDescription({ event }: EventDescriptionProps) {
  return (
    <>
      <p>{event?.description}</p>
      <div className="space-x-2 flex flex-row">
        <Badge variant="event" color={event?.topic.color || ""}>
          {event?.topic.name}
        </Badge>
        <Badge variant="event" color={event?.type.color || ""}>
          {event?.type.name}
        </Badge>
      </div>
      {event && (
        <div className="text-sm text-muted-foreground">
          <FullDateDescription
            from={new Date(event.from)}
            to={new Date(event.to)}
          />
        </div>
      )}
    </>
  );
}
