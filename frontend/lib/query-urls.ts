import {ReadonlyURLSearchParams} from "next/navigation";
import {CalendarView} from "@/components/event-calendar";

export function createNewQueryString (name: string, values: string[]) {
  const params = new URLSearchParams(values.map((v) => [name, v]));
  return params.toString();
}

export function mergeQueryString (params: ReadonlyURLSearchParams, name: string, values: string[]) {
  const newParams = new URLSearchParams(params);
  for (const v of values) {
    newParams.set(name, v)
  }
  return newParams.toString();
}

export function getFiltersFromQuery (params: ReadonlyURLSearchParams) {
  const topicFilters = params.getAll("to");
  const typeFilters = params.getAll("ty");

  return {topics: topicFilters, types: typeFilters};
}

export function getViewModeFromQuery (params: ReadonlyURLSearchParams) {
  const possibleViews: CalendarView[] = ['agenda', 'day', "week", "month"]
  const value =  params.get('vm')

  if(!!value && possibleViews.includes(value as CalendarView)) return value as CalendarView
  else return null
}