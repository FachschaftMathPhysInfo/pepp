"use client";

import {
  Event,
  Label,
  PlannerEventsDocument,
  PlannerEventsQuery,
  PlannerEventsQueryVariables,
  Role,
  UmbrellaDetailDocument,
  UmbrellaDetailQuery,
} from "@/lib/gql/generated/graphql";
import {FacetedFilter} from "@/components/faceted-filter";
import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getClient } from "@/lib/graphql";
import { CopyTextArea } from "@/components/copy-text-area";
import { CardSkeleton } from "@/components/card-skeleton";
import { Planner } from "@/components/planner";
import { useRefetch, useUser } from "@/components/providers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultEvent, defaultLabel } from "@/types/defaults";
import EditPlannerSection from "./edit-planner-section";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { cn } from "@/lib/utils";
import {TooltipProvider} from "@/components/ui/tooltip";

interface PlannerPageProps {
  umbrellaID: number;
}

enum View {
  planner = "Stundenplan",
  table = "Tabelle",
}

export function PlannerPage({umbrellaID}: PlannerPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const {user} = useUser();
  const {refetchKey} = useRefetch();

  const [events, setEvents] = useState<Event[]>([]);
  const [types, setTypes] = useState<Label[]>([]);
  const [topics, setTopics] = useState<Label[]>([]);
  const [topicFilter, setTopicFilter] = useState<string[]>(searchParams.getAll("to"));
  const [typesFilter, setTypesFilter] = useState<string[]>(searchParams.getAll("ty"));
  const [icalPath, setIcalPath] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [view, setView] = useState(View.planner);
  const [umbrella, setUmbrella] = useState<Event>(defaultEvent);

  const createQueryString = useCallback((name: string, values: string[]) => {
    const params = new URLSearchParams(values.map((v) => [name, v]));
    return params.toString();
  }, []);

  const renderView = () => {
    switch (view) {
      case View.planner:
        return <Planner events={events}/>;
      case View.table:
        return <DataTable columns={columns} data={events}/>;
    }
  };

  const fetchUmbrellaData = useCallback(async () => {
    setLoading(true);
    const client = getClient();

    const umbrellaData = await client.request<UmbrellaDetailQuery>(
      UmbrellaDetailDocument,
      {id: umbrellaID}
    );

    if (umbrellaData) {
      setUmbrella({...defaultEvent, ...umbrellaData.umbrellas[0]})
    }

    setLoading(false);
  }, [umbrellaID])

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);

      const client = getClient();

      const vars: PlannerEventsQueryVariables = {
        umbrellaID: umbrellaID ?? 0,
        topic: topicFilter.length == 0 ? undefined : topicFilter,
        type: typesFilter.length == 0 ? undefined : typesFilter,
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
            topic: {...defaultLabel, ...e.topic},
          }))
        );
        setIsRestricted(!!eventData.umbrellas[0].registrationForm);
      }

      setLoading(false);
    }

    void fetchEventData();
  }, [topicFilter, typesFilter, umbrellaID, refetchKey]);

  useEffect(() => {
    router.push(
      pathname +
      "?" +
      createQueryString("to", topicFilter) +
      (typesFilter.length && topicFilter.length ? "&" : "") +
      createQueryString("ty", typesFilter)
    );
  }, [topicFilter, typesFilter]);

  useEffect(() => {
    setTypesFilter([]);
    setTopicFilter([]);
    void fetchUmbrellaData()
  }, [umbrellaID]);

  useEffect(() => {
    setIcalPath(
      window.location.origin +
      "/ical/?e=" +
      umbrellaID +
      (searchParams.size ? "&" + searchParams : "")
    );
  }, [searchParams]);

  const application = user?.applications?.find(
    (a) => a.event.ID === umbrellaID
  );

  return (
    <TooltipProvider delayDuration={0}>
      {user?.role === Role.Admin && (
        <section className="mb-[20px] space-y-5">
          <EditPlannerSection umbrella={umbrella} refreshData={fetchUmbrellaData} />
        </section>
      )}

      {events.length > 0 && (
        <section className="flex flex-row items-center justify-between flex-wrap gap-4 mt-4">
          <div className="flex items-center justify-center gap-x-4">

            {user?.role === Role.Admin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Ansicht
                    <ChevronsUpDown className="h-4 w-4"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {Object.values(View).map((v) => (
                    <DropdownMenuItem key={v} onClick={() => setView(v)}>
                      <Check
                        className={cn(
                          "h-4 w-4 mr-2",
                          v === view ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {v}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {topics.length >= 2 && (
              <FacetedFilter
                className={'h-full'}
                options={topics.map((t) => t.name)}
                setFilter={setTopicFilter}
                title={'Themen'}
              />
            )}

            {types.length >= 2 && (
              <FacetedFilter
                className={'h-full'}
                options={types.map((t) => t.name)}
                setFilter={setTypesFilter}
                title={'Veranstaltungsart'}
              />
            )}
          </div>

          <CopyTextArea label="ICS-Kalender" text={icalPath}/>
        </section>
      )}

      {isRestricted && !application && (
        <section>
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4"/>
            <AlertTitle className="font-bold">
              Registrierung erforderlich!
            </AlertTitle>
            <AlertDescription className="flex flex-col">
              Diese Veranstaltung ist aus Kapazitätsgründen
              zulassungsbeschränkt.
              <Button
                variant="secondary"
                className="mt-2 w-fit h-fit"
                onClick={() => router.push(`${pathname}/register`)}
              >
                Zur Anmeldung
                <ChevronRight/>
              </Button>
            </AlertDescription>
          </Alert>
        </section>
      )}

      <section className="mt-5">
        {loading ? <CardSkeleton/> : renderView()}
      </section>
    </TooltipProvider>
  );
}
