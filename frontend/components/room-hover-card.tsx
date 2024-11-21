import {
  Room,
} from "@/lib/gql/generated/graphql";
import {
  ArrowDownToDot,
  Building2,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import MapPreview from "./map-preview";
import React from "react";

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
        <div className="p-4 space-y-4">
          <div className="flex flex-row space-x-2">
            <Building2 className="h-5 w-5" />
            <div>
              <p className="font-bold">{room.building.name}</p>
              <p className="text-xs text-muted-foreground">
                {room.building.street + " " + room.building.number}
              </p>
              <div className="flex flex-row space-x-1 text-xs text-muted-foreground">
                <p>{room.building.zip},</p>
                <p>{room.building.city}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row space-x-2">
            <ArrowDownToDot className="h-5 w-5" />
            <div>
              <p className="font-bold">{room.name ? room.name : room.number}</p>
              {room.name && (
                <p className="text-xs text-muted-foreground">{room.number}</p>
              )}
              {room.floor !== null && (
                <p className="text-xs text-muted-foreground">
                  Ebene {room.floor}
                </p>
              )}
            </div>
          </div>
        </div>
        <MapPreview
          height="100%"
          width="100%"
          latitude={room.building.latitude ?? 0}
          longitude={room.building.longitude ?? 0}
          zoom={room.building.zoomLevel}
          className="rounded-tr-lg rounded-br-lg"
        />
      </HoverCardContent>
    </HoverCard>
  );
}
