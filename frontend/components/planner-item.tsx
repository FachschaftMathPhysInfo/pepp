import { Event, Tutorial } from "@/lib/gql/generated/graphql";
import { formatDateToHHMM, hexToRGBA } from "@/lib/utils";
import React from "react";
import { Clock, SquareCheckBig } from "lucide-react";
import { RoomHoverCard } from "./room-hover-card";

interface PlannerItemProps {
  event: Event;
  setCloseupID: React.Dispatch<React.SetStateAction<number>>;
  setEventDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  height?: number;
  registration?: Tutorial;
}

export default function PlannerItem({
  event,
  setCloseupID,
  setEventDialogOpen,
  height = 20,
  registration,
}: PlannerItemProps) {
  return (
    <li
      key={event.ID}
      className={`rounded-lg p-2 cursor-pointer hover:outline hover:outline-offset-2 hover:outline-gray-300 hover:outline-1 transition-opacity flex flex-row justify-between`}
      style={{
        backgroundColor: hexToRGBA(event.topic.color ?? "#FFF", 0.3),
        height: `${height}px`,
      }}
      role="button"
      tabIndex={0}
      onClick={() => {
        setCloseupID(event.ID);
        setEventDialogOpen(true);
      }}
    >
      <div className="flex flex-row">
        <div
          className="h-full w-1 rounded-lg mr-2"
          style={{
            backgroundColor: event.topic.color ?? "#FFF",
          }}
        />

        <div>
          <p className="text-sm font-bold">{event.title}</p>
          <div className="flex flex-row items-center space-x-1">
            <Clock className="h-3 w-3" />
            <p className="text-sm">
              {formatDateToHHMM(new Date(event.from))} -{" "}
              {formatDateToHHMM(new Date(event.to))}
            </p>
          </div>
        </div>
      </div>
      {registration && (
        <div className="flex flex-row space-x-2 mt-2 w-fit h-fit py-1 px-2 rounded-lg text-black bg-white border-l-4 border-green-500">
          <SquareCheckBig className="w-4 h-4 text-green-700" />
          <RoomHoverCard room={registration.room} />
        </div>
      )}
    </li>
  );
}
