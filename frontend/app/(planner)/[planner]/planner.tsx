"use client";

import {
  Event,
  Label,
  PlannerEventsDocument,
  PlannerEventsQuery,
  PlannerEventsQueryVariables,
  Role,
} from "@/lib/gql/generated/graphql";
import React, {useCallback, useEffect, useState} from "react";

import Filter from "@/components/filter";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {getClient} from "@/lib/graphql";
import {CopyTextArea} from "@/components/copy-text-area";
import {CardSkeleton} from "@/components/card-skeleton";
import {Planner} from "@/components/planner";
import {useUser} from "@/components/providers";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Check, ChevronRight, ChevronsUpDown, TriangleAlert,} from "lucide-react";
import {Button} from "@/components/ui/button";
import {defaultEvent, defaultLabel} from "@/types/defaults";
import EditPlannerSection from "./edit-planner-section";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {PlannerTable} from "@/app/(planner)/table/planner-table";
import {plannerColumns} from "@/app/(planner)/table/planner-columns";
import {cn} from "@/lib/utils";
import {Select, SelectContent, SelectTrigger, SelectValue} from "@/components/ui/select";

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

  const [events, setEvents] = useState<Event[]>([]);
  const [types, setTypes] = useState<Label[]>([]);
  const [topics, setTopics] = useState<Label[]>([]);
  const [toFilter, setToFilter] = useState<string[]>(searchParams.getAll("to"));
  const [tyFilter, setTyFilter] = useState<string[]>(searchParams.getAll("ty"));
  const [icalPath, setIcalPath] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [view, setView] = useState(View.planner);

  const createQueryString = useCallback((name: string, values: string[]) => {
    const params = new URLSearchParams(values.map((v) => [name, v]));
    return params.toString();
  }, []);

  const renderView = () => {
    switch (view) {
      case View.planner:
        return <Planner events={events}/>;
      case View.table:
        return <PlannerTable columns={plannerColumns} data={events}/>;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const client = getClient();

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
            topic: {...defaultLabel, ...e.topic},
          }))
        );
        setIsRestricted(!!eventData.umbrellas[0].registrationForm);
      }

      setLoading(false);
    };

    void fetchData();
  }, [toFilter, tyFilter, umbrellaID]);

  useEffect(() => {
    router.push(
      pathname +
      "?" +
      createQueryString("to", toFilter) +
      (tyFilter.length && toFilter.length ? "&" : "") +
      createQueryString("ty", tyFilter)
    );
  }, [createQueryString, pathname, router, toFilter, tyFilter]);

  useEffect(() => {
    setTyFilter([]);
    setToFilter([]);
  }, [umbrellaID]);

  useEffect(() => {
    setIcalPath(
      window.location.origin +
      "/ical/?e=" +
      umbrellaID +
      (searchParams.size ? "&" + searchParams : "")
    );
  }, [searchParams, umbrellaID]);

  const application = user?.applications?.find(
    (a) => a.event.ID === umbrellaID
  );

  return (
    <>
      {user?.role === Role.Admin && (
        <section className="mb-[20px] space-y-3">
          <EditPlannerSection umbrellaID={umbrellaID}/>
        </section>
      )}

      {/* TODO: fix mobile stuff */}
      {events.length > 0 && (
        <section className="sm:flex sm:flex-row sm:items-end sm:justify-between sm:flex-wrap mt-12">
          <div className="flex flex-row justify-between items-end w-full">
            <div className={'flex justify-between items-end gap-x-6'}>
              {user?.role === Role.Admin && (
                <span className={'space-y-2'}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {view}
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
                  </span>
              )}

              <span className={"flex justify-between items-end gap-x-3"}>
                  {topics.length >= 2 && (
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Themen"/>
                      </SelectTrigger>
                      <SelectContent>
                        <div className={'p-2'}>
                          <Filter
                            options={topics.map((t) => t.name)}
                            filter={toFilter}
                            setFilter={setToFilter}
                            orientation={"column"}
                          />
                        </div>
                      </SelectContent>
                    </Select>
                  )}

                {types.length >= 2 && (
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Veranstaltungsarten"/>
                    </SelectTrigger>
                    <SelectContent>
                      <div className={'p-2'}>
                        <Filter
                          options={types.map((t) => t.name)}
                          filter={tyFilter}
                          setFilter={setTyFilter}
                          orientation={"column"}
                        />
                      </div>
                    </SelectContent>
                  </Select>
                )}
                </span>
            </div>

            <div>

              <CopyTextArea label="ICS-Kalender" text={icalPath}/>
            </div>
          </div>
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
    </>
  );
}
