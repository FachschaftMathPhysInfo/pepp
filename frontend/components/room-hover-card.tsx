import {
  Room,
} from "@/lib/gql/generated/graphql";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import React from "react";
import {RoomDetail} from "./room-detail";
import MapPreview from "./map-preview";

interface RoomHoverCardProps {
  room: Room;
}

export function RoomHoverCard({ room }: RoomHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="group">
          <p className="text-xs text-muted-foreground group-hover:underline">
            {room.building.name}
          </p>
          <p className="group-hover:underline">
            {room.name ? room.name : room.number}
          </p>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="min-w-[400px] p-0 flex flex-row">
        <RoomDetail room={room} className="space-y-4"/>
        <MapPreview
          height="100%"
          width="100%"
          latitude={room.building.latitude}
          longitude={room.building.longitude}
          zoom={room.building.zoomLevel}
          className="rounded-tr-lg rounded-br-lg"
        />
      </HoverCardContent>
    </HoverCard>
  );
}
