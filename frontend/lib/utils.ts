import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Event } from "./gql/generated/graphql";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type GroupedEvents = {
  [week: number]: {
    [day: string]: Event[];
  };
};

export const groupEvents = (events: Event[]): GroupedEvents => {
  const groupedEvents: GroupedEvents = {};

  events.forEach((event) => {
    const date = new Date(event.from);
    const week = getISOWeekNumber(date);
    const day = date.toLocaleString(undefined, { weekday: "long" });

    if (!groupedEvents[week]) {
      groupedEvents[week] = {};
    }

    if (!groupedEvents[week][day]) {
      groupedEvents[week][day] = [];
    }

    groupedEvents[week][day].push(event);
  });

  return groupedEvents;
};

export const getISOWeekNumber = (date: Date): number => {
  const tempDate = new Date(date.getTime());

  tempDate.setHours(12, 0, 0, 0);

  const dayOfWeek = tempDate.getDay();
  const dayDiff = (dayOfWeek + 6) % 7;

  tempDate.setDate(tempDate.getDate() - dayDiff + 3);

  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);

  const diff = tempDate.getTime() - firstThursday.getTime();

  const oneDay = 86400000;
  const daysSinceFirstThursday = Math.floor(diff / oneDay);

  return 1 + Math.floor(daysSinceFirstThursday / 7);
};

export const formatDateToDDMM = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
};

export const formatDateToHHMM = (date: Date): string => {
  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const calculateEventDurationInHours = (from: string, to: string) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const durationMs = toDate.getTime() - fromDate.getTime();
  return durationMs / (1000 * 60 * 60);
};

export const extractId = (slug: string) => {
  const match = slug.match(/(?:^|\/)[^\/]+-(\d+)(?:\/?|$)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
};

export const slugify = (title: string) => {
  let slug = title.toLowerCase();
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  slug = slug.replace(/[^a-z0-9\s-]/g, "");
  slug = slug.replace(/[\s-]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
};

export const hexToRGBA = (hex: string, alpha = 1) => {
  hex = hex.replace(/^#/, "");

  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error("Invalid hex color");
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const groupEventsByUmbrellaId = (events: Event[]) => {
  return events?.reduce((acc, event) => {
    const umbrellaId = event.umbrella?.ID;
    if (!acc[umbrellaId ?? 0]) {
      acc[umbrellaId ?? 0] = [];
    }
    acc[umbrellaId ?? 0].push(event);
    return acc;
  }, {} as { [key: string]: Event[] });
};
