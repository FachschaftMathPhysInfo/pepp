import { Room } from "@/lib/gql/generated/graphql";
import { cn } from "@/lib/utils";
import { ArrowDownToDot, Building2 } from "lucide-react";
import React from "react";

interface RoomDetailProps extends React.HtmlHTMLAttributes<HTMLDivElement>{
  room: Room;
}

export function RoomDetail({ room, className }: RoomDetailProps) {
  return (
      <div className={cn(className, "p-4")}>
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
            {room.floor && (
              <p className="text-xs text-muted-foreground">
                Ebene {room.floor}
              </p>
            )}
          </div>
        </div>
      </div>
  );
}
