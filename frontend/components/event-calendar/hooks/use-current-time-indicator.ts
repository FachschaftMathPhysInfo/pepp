"use client";

import { useEffect, useState } from "react";

import {
  EndHour,
  StartHour,
} from "@/components/event-calendar/constants";
import { DateTime, Interval } from "luxon";

export function useCurrentTimeIndicator(
  currentDate: DateTime,
  view: "day" | "week"
) {
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  const [currentTimeVisible, setCurrentTimeVisible] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimePosition = () => {
      const now = DateTime.now();
      const hours = now.hour;
      const minutes = now.minute;
      const totalMinutes = (hours - StartHour) * 60 + minutes;
      const dayStartMinutes = 0; // 12am
      const dayEndMinutes = (EndHour - StartHour) * 60; // 12am next day

      // Calculate position as percentage of day
      const position =
        ((totalMinutes - dayStartMinutes) / (dayEndMinutes - dayStartMinutes)) *
        100;

      // Check if current day is in view based on the calendar view
      let isCurrentTimeVisible = false;

      if (view === "day") {
        isCurrentTimeVisible = now.hasSame(currentDate, "day");
      } else if (view === "week") {
        const startOfWeekDate = currentDate.startOf("week");
        const endOfWeekDate = currentDate.endOf("week");
        isCurrentTimeVisible = Interval.fromDateTimes(
          startOfWeekDate,
          endOfWeekDate
        ).contains(now);
      }

      setCurrentTimePosition(position);
      setCurrentTimeVisible(isCurrentTimeVisible);
    };

    // Calculate immediately
    calculateTimePosition();

    // Update every minute
    const interval = setInterval(calculateTimePosition, 60000);

    return () => clearInterval(interval);
  }, [currentDate, view]);

  return { currentTimePosition, currentTimeVisible };
}
