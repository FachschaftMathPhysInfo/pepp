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
import { useUmbrella, useUser } from "@/components/providers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultEvent, defaultLabel } from "@/types/defaults";

export default function IndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { user } = useUser();
  const { umbrellaID } = useUmbrella();

  const [events, setEvents] = useState<Event[]>([]);
  const [types, setTypes] = useState<Label[]>([]);
  const [topics, setTopics] = useState<Label[]>([]);
  const [toFilter, setToFilter] = useState<string[]>(searchParams.getAll("to"));
  const [tyFilter, setTyFilter] = useState<string[]>(searchParams.getAll("ty"));
  const [icalPath, setIcalPath] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);

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
        setTypes(eventData.typeLabels);
        setTopics(eventData.topicLabels);
        setEvents(
          eventData.events.map((e) => ({
            ...defaultEvent,
            ...e,
            topic: { ...defaultLabel, ...e.topic },
          }))
        );
        if (eventData.umbrellas[0].registrationForm) {
          setIsRestricted(true);
        } else {
          setIsRestricted(false);
        }
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
    setTyFilter([]);
    setToFilter([]);
  }, [umbrellaID]);

  useEffect(() => {
    setIcalPath(window.location.origin + "/ical/?" + searchParams);
  }, [searchParams]);

  const application = user?.applications?.find((a) => a.event.ID === umbrellaID);

  return (
    <>
      {events.length > 0 && (
        <section className="flex flex-row items-end justify-between">
          {(topics.length >= 2 || types.length >= 2) && (
            <div className="space-y-2">
              {topics.length >= 2 && (
                <Filter
                  title="Thema"
                  options={topics.map((t) => t.name)}
                  filter={toFilter}
                  setFilter={setToFilter}
                />
              )}
              {types.length >= 2 && (
                <Filter
                  title="Veranstaltungsart"
                  options={types.map((t) => t.name)}
                  filter={tyFilter}
                  setFilter={setTyFilter}
                />
              )}
            </div>
          )}
          <CopyTextArea label="ICS-Kalender" text={icalPath} />
        </section>
      )}

      {isRestricted && !application && (
        <section>
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle className="font-bold">
              Registrierung erforderlich!
            </AlertTitle>
            <AlertDescription className="flex flex-col">
              Diese Veranstaltung ist aus Kapazitätsgründen
              zulassungsbeschränkt.
              <Button
                variant="secondary"
                className="mt-2 w-fit h-fit"
                onClick={() => router.push("/register?e=" + umbrellaID)}
              >
                Zur Anmeldung
                <ChevronRight />
              </Button>
            </AlertDescription>
          </Alert>
        </section>
      )}

      <section>
        {loading ? <CardSkeleton /> : <Planner events={events} />}
      </section>
    </>
  );
}
