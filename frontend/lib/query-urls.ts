import {ReadonlyURLSearchParams} from "next/navigation";

export function createQueryString (name: string, values: string[]) {
  const params = new URLSearchParams(values.map((v) => [name, v]));
  return params.toString();
}

export function getFiltersFromQuery (params: ReadonlyURLSearchParams) {
  const topicFilters = params.getAll("to");
  const typeFilters = params.getAll("ty");

  return {topics: topicFilters, types: typeFilters};
}