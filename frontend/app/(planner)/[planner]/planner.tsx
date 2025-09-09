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
import React, {useCallback, useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {getClient} from "@/lib/graphql";
import {CopyTextArea} from "@/components/copy-text-area";
import {useRefetch, useUser} from "@/components/providers";
import {Alert, AlertAction, AlertDescription, AlertTitle,} from "@/components/ui/alert";
import {CircleAlert, FunnelPlus, Loader2, MoveRight} from "lucide-react";
import {defaultEvent, defaultLabel} from "@/types/defaults";
import EditPlannerSection from "./edit-planner-section";
import {TooltipProvider} from "@/components/ui/tooltip";
import {EventCalendar} from "@/components/event-calendar";

interface PlannerPageProps {
  umbrellaID: number;
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
  const [topicFilter, setTopicFilter] = useState<number[]>([]);
  const [typesFilter, setTypesFilter] = useState<number[]>([]);
  const [icalPath, setIcalPath] = useState<string>("");
  const [umbrellaLoading, setUmbrellaLoading] = useState<boolean>(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [umbrella, setUmbrella] = useState<Event>(defaultEvent);

  // TODO: reimplement this later
  // const createQueryString = useCallback((name: string, values: string[]) => {
  //   const params = new URLSearchParams(values.map((v) => [name, v]));
  //   return params.toString();
  // }, []);

  const fetchUmbrellaData = useCallback(async () => {
    setUmbrellaLoading(true);
    const client = getClient();

    const umbrellaData = await client.request<UmbrellaDetailQuery>(
      UmbrellaDetailDocument,
      {id: umbrellaID}
    );

    if (umbrellaData) {
      setUmbrella({
        ...defaultEvent,
        ...umbrellaData.umbrellas[0],
        supportingEvents: umbrellaData.umbrellas[0].supportingEvents?.map(
          (e) => ({
            ...defaultEvent,
            ...e,
          })
        ),
      });
    }

    setUmbrellaLoading(false);
  }, [umbrellaID]);

  useEffect(() => {
    const fetchEventData = async () => {
      const client = getClient();

      const vars: PlannerEventsQueryVariables = {
        umbrellaID: umbrellaID ?? 0,
        topic: topicFilter.length ? topicFilter : undefined,
        type: typesFilter.length ? typesFilter : undefined,
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
    };

    void fetchEventData();
  }, [topicFilter, typesFilter, umbrellaID, refetchKey]);

  useEffect(() => {
    void fetchUmbrellaData();
  }, [refetchKey]);

  // TODO: Reimplementation of the link filter feature
  //
  // useEffect(() => {
  //   router.push(
  //     pathname +
  //       "?" +
  //       createQueryString("to", topicFilter) +
  //       (typesFilter.length && topicFilter.length ? "&" : "") +
  //       createQueryString("ty", typesFilter)
  //   );
  // }, [topicFilter, typesFilter]);

  useEffect(() => {
    setTypesFilter([]);
    setTopicFilter([]);
    void fetchUmbrellaData();
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

  return umbrellaLoading ? (
    <div className="flex flex-1 justify-center items-center text-center">
      <span className={"flex flex-col gap-y-2"}>
        <Loader2 size={50} className="animate-spin text-gray-400"/>
      </span>
    </div>
  ) : (
    <TooltipProvider delayDuration={0}>
      {user?.role === Role.Admin && (
        <section className="mb-[20px] space-y-5">
          <EditPlannerSection umbrella={umbrella}/>
        </section>
      )}

      {events.length > 0 && (
        <section className="flex items-stretch justify-between flex-wrap gap-4 mt-4">
          {(topics.length >= 2 || types.length >= 2) && (
            <div className="flex items-center gap-x-2 flex-wrap border p-2 rounded-lg">
              <FunnelPlus size={20}/>

              {topics.length >= 2 && (
                <FacetedFilter
                  className={"h-full"}
                  options={topics}
                  setFilter={setTopicFilter}
                  title={"Studiengänge"}
                />
              )}

              {types.length >= 2 && (
                <FacetedFilter
                  className={"h-full"}
                  options={types}
                  setFilter={setTypesFilter}
                  title={"Veranstaltungsart"}
                />
              )}
            </div>
          )}

          <div className={'h-full'}><CopyTextArea label="ICS-Kalender" text={icalPath}/></div>
        </section>
      )}

      {isRestricted && !application && (
        <section>
          <Alert
            className={"cursor-pointer bg-destructive-foreground my-4"}
            onClick={() => router.push(`${pathname}/register`)}
            variant="warning"
          >
            <CircleAlert className="size-4"/>
            <AlertTitle className="font-bold">
              Registrierung erforderlich!
            </AlertTitle>
            <AlertDescription className="pr-8">
              Diese Veranstaltung ist aus Kapazitätsgründen
              zulassungsbeschränkt. Bitte nimm an einem kurzen Quiz teil, damit
              wir einschätzen können, ob du diesen Kurs benötigst.
            </AlertDescription>
            <AlertAction>
              <MoveRight className="size-4"/>
            </AlertAction>
          </Alert>
        </section>
      )}

      <section className="mt-5">
        <EventCalendar events={events} initialView={"agenda"}/>
      </section>
    </TooltipProvider>
  );
}
