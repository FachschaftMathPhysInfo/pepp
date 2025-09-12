import {ReadonlyURLSearchParams} from "next/navigation";
import {CalendarView} from "@/components/event-calendar";

export const VIEWMODE_QUERY_KEY = 'vm'
export const TYPEFILTER_QUERY_KEY = 'ty'
export const TOPICFILTER_QUERY_KEY = 'to'

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
  const topicFilters = params.getAll(TOPICFILTER_QUERY_KEY);
  const typeFilters = params.getAll(TYPEFILTER_QUERY_KEY);

  return {topics: topicFilters, types: typeFilters};
}

export function getViewModeFromQuery (params: ReadonlyURLSearchParams) {
  const possibleViews: CalendarView[] = ['agenda', 'day', "week", "month"]
  const value =  params.get(VIEWMODE_QUERY_KEY)

  if(!!value && possibleViews.includes(value as CalendarView)) return value as CalendarView
  else return null
}