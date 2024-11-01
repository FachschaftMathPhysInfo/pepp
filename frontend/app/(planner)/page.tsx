"use client";

import {
  Event,
  Label,
  PlannerEventsDocument,
  PlannerEventsQuery,
  PlannerEventsQueryVariables,
} from "@/lib/gql/generated/graphql";
import React, { useCallback, useEffect, useState } from "react";

import Filter from "@/components/filter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { client } from "@/lib/graphql";
import { CopyTextArea } from "@/components/copy-text-area";
import { CardSkeleton } from "@/components/card-skeleton";
import { Planner } from "@/components/planner";
import { useUmbrella } from "@/components/providers";

export default function IndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { umbrellaID } = useUmbrella();

  const [events, setEvents] = useState<Event[]>([]);
  const [types, setTypes] = useState<Label[]>([]);
  const [topics, setTopics] = useState<Label[]>([]);
  const [toFilter, setToFilter] = useState<string[]>(searchParams.getAll("to"));
  const [tyFilter, setTyFilter] = useState<string[]>(searchParams.getAll("ty"));
  const [icalPath, setIcalPath] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const createQueryString = useCallback((name: string, values: string[]) => {
    const params = new URLSearchParams(values.map((v) => [name, v]));
    return params.toString();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const vars: PlannerEventsQueryVariables = {
        umbrellaID: umbrellaID ?? 0,
        topic: toFilter.length == 0 ? undefined : toFilter,
        type: tyFilter.length == 0 ? undefined : tyFilter,
      };

      const eventData = await client.request<PlannerEventsQuery>(
        PlannerEventsDocument,
        vars
      );

      if (eventData.events.length) {
        if (eventData.typeLabels.length >= 2) {
          setTypes(eventData.typeLabels);
        }
        if (eventData.topicLabels.length >= 2) {
          setTopics(eventData.topicLabels);
        }
        setEvents(
          eventData.events.map((e) => ({
            type: { name: "" },
            needsTutors: true,
            ID: e.ID,
            title: e.title,
            from: e.from,
            to: e.to,
            topic: { name: "", color: e.topic.color },
          }))
        );
        setLoading(false);
      }
    };

    router.push(
      pathname +
        "?" +
        createQueryString("e", [umbrellaID?.toString() ?? "0"]) +
        (toFilter.length ? "&" : "") +
        createQueryString("to", toFilter) +
        (tyFilter.length ? "&" : "") +
        createQueryString("ty", tyFilter)
    );
    fetchData();
  }, [toFilter, tyFilter, umbrellaID]);

  useEffect(() => {
    setIcalPath(window.location.origin + "/ical/?" + searchParams);
  }, [searchParams]);

  return (
    <>
      {events.length > 0 && (
        <section className="flex flex-row items-end">
          <div className="space-y-2">
            <Filter
              title="Thema"
              options={topics.map((t) => t.name)}
              filter={toFilter}
              setFilter={setToFilter}
            />
            <Filter
              title="Veranstaltungsart"
              options={types.map((t) => t.name)}
              filter={tyFilter}
              setFilter={setTyFilter}
            />
          </div>
          <div className="w-full" />
          <CopyTextArea label="ICS-Kalender" text={icalPath} />
        </section>
      )}

      <section>
        {loading ? <CardSkeleton /> : <Planner events={events} />}
      </section>
    </>
  );
}
