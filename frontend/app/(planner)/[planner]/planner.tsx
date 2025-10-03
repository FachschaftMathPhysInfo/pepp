"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Event,
  Label,
  PlannerEventsDocument,
  PlannerEventsQuery,
  PlannerEventsQueryVariables,
  Role,
  Setting,
  SettingsDocument,
  SettingsQuery,
  UmbrellaDetailDocument,
  UmbrellaDetailQuery,
} from "@/lib/gql/generated/graphql";
import { FacetedFilter } from "@/components/faceted-filter";
import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getClient } from "@/lib/graphql";
import { CopyTextArea } from "@/components/copy-text-area";
import { useRefetch } from "@/components/provider/refetch-provider";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CircleAlert, FunnelPlus, Loader2, MoveRight } from "lucide-react";
import { defaultEvent } from "@/types/defaults";
import EditPlannerSection from "./edit-planner-section";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EventCalendar } from "@/components/event-calendar";
import {
  createNewQueryString,
  getEventFiltersFromQuery,
  TOPICFILTER_QUERY_KEY,
  TYPEFILTER_QUERY_KEY,
} from "@/lib/query-urls";
import Link from "next/link";
import {
  DiscordIcon,
  MatrixIcon,
  WhatsappIcon,
} from "@/components/social-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useUser } from "@/components/provider/user-provider";
import { useUI } from "@/components/provider/ui-provider";

interface PlannerPageProps {
  umbrellaID: number;
}

export function PlannerPage({ umbrellaID }: PlannerPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { user } = useUser();
  const { refetchKey } = useRefetch();
  const { isMobile } = useUI();

  const [socials, setSocials] = useState<Setting[] | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [types, setTypes] = useState<Label[]>([]);
  const [topics, setTopics] = useState<Label[]>([]);
  const [topicFilter, setTopicFilter] = useState<number[]>([]);
  const [typesFilter, setTypesFilter] = useState<number[]>([]);
  const [icalPath, setIcalPath] = useState<string>("");
  const [umbrellaLoading, setUmbrellaLoading] = useState<boolean>(true);
  const [isRestricted, setIsRestricted] = useState(false);
  const [umbrella, setUmbrella] = useState<Event>(defaultEvent);
  const [hasInitializedFromParams, setHasInitializedFromParams] =
    useState<boolean>(false);

  const fetchUmbrellaData = useCallback(async () => {
    setUmbrellaLoading(true);
    const client = getClient();

    const umbrellaData = await client.request<UmbrellaDetailQuery>(
      UmbrellaDetailDocument,
      { id: umbrellaID }
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
    const client = getClient();

    const fetchEventData = async () => {
      const vars: PlannerEventsQueryVariables = {
        umbrellaID: umbrellaID ?? 0,
        topics: topicFilter.length ? topicFilter : undefined,
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
          }))
        );
        setIsRestricted(!!eventData.umbrellas[0].registrationForm);
      }
    };

    void fetchEventData();
  }, [topicFilter, typesFilter, umbrellaID, refetchKey]);

  useEffect(() => {
    const client = getClient();
    const fetchSocial = async () => {
      try {
        const settingsData = await client.request<SettingsQuery>(
          SettingsDocument,
          {
            key: ["social-whatsapp", "social-discord", "social-matrix"],
          }
        );
        setSocials(settingsData.settings);
      } catch {
        toast.error("Fehler beim Laden der Einstellungen.");
      }
    };

    void fetchSocial();
  }, []);

  useEffect(() => {
    void fetchUmbrellaData();
  }, [refetchKey]);

  // Builds Query URL for sharing filters
  useEffect(() => {
    const topicFilterNames = topics
      .filter((t) => topicFilter.includes(t.ID))
      .map((t) => t.name);
    const typesFilterNames = types
      .filter((t) => typesFilter.includes(t.ID))
      .map((t) => t.name);

    router.push(
      pathname +
        "?" +
        createNewQueryString(TOPICFILTER_QUERY_KEY, topicFilterNames) +
        (typesFilter.length && topicFilter.length ? "&" : "") +
        createNewQueryString(TYPEFILTER_QUERY_KEY, typesFilterNames)
    );
  }, [topicFilter, typesFilter]);

  // Initializes filters from search params
  useEffect(() => {
    // Locks this after URL init
    if (hasInitializedFromParams) return;
    // Awaits labels to load
    if (!topics.length && !types.length) return;

    const filterNames = getEventFiltersFromQuery(searchParams);
    const typeFilters = types
      .filter((t) => filterNames.types.includes(t.name))
      .map((t) => t.ID);
    const topicFilters = topics
      .filter((t) => filterNames.topics.includes(t.name))
      .map((t) => t.ID);

    setTypesFilter(typeFilters);
    setTopicFilter(topicFilters);
    setHasInitializedFromParams(true);
  }, [searchParams, topics, types]);

  useEffect(() => {
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

  const accepted: boolean = !!user?.applications?.find(
    (a) => a.event.ID === umbrellaID
  )?.accepted;

  function getSocialValue(key: string) {
    const s = socials?.find((s) => s.key === key);
    return s ? s.value : "";
  }

  const wa = getSocialValue("social-whatsapp");
  const matrix = getSocialValue("social-matrix");
  const discord = getSocialValue("social-discord");

  return umbrellaLoading ? (
    <div className="flex flex-1 justify-center items-center text-center">
      <span className={"flex flex-col gap-y-2"}>
        <Loader2 size={50} className="animate-spin text-gray-400" />
      </span>
    </div>
  ) : (
    <TooltipProvider delayDuration={0}>
      {user?.role === Role.Admin && (
        <section className="mb-[20px] space-y-5">
          <EditPlannerSection umbrella={umbrella} />
        </section>
      )}

      {events.length > 0 && (
        <section className="flex items-stretch justify-between flex-wrap gap-4 mt-4">
          {(topics.length >= 2 || types.length >= 2) && (
            <div className="flex items-center gap-x-2 border p-2 rounded-lg">
              <FunnelPlus size={20} className={"flex-shrink-0"} />

              <span className={"flex flex-wrap items-center gap-2"}>
                {topics.length >= 2 && (
                  <FacetedFilter
                    className={"h-full"}
                    options={topics}
                    filters={topicFilter}
                    setFilter={setTopicFilter}
                    title={"Studiengänge"}
                  />
                )}

                {types.length >= 2 && (
                  <FacetedFilter
                    className={"h-full"}
                    options={types}
                    filters={typesFilter}
                    setFilter={setTypesFilter}
                    title={"Veranstaltungsart"}
                  />
                )}
              </span>
            </div>
          )}

          <div className="flex flex-row gap-x-2">
            <CopyTextArea
              className="w-40 h-full"
              label="ICS-Kalender"
              text={icalPath}
            />
            {(wa || matrix || discord) && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex flex-col justify-between p-2 border rounded-lg">
                    <div className="space-x-2 flex flex-row">
                      {wa && <WhatsappIcon className="size-4" />}
                      {discord && <DiscordIcon className="size-4" />}
                    </div>
                    {matrix && <MatrixIcon className="h-4" />}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="flex flex-row gap-x-4 w-fit">
                  {wa && (
                    <ShareArea
                      icon={<WhatsappIcon className="size-4" />}
                      label="Aktuelle WhatsApp Gruppe"
                      link={wa}
                    />
                  )}
                  {matrix && (
                    <ShareArea
                      icon={<MatrixIcon className="h-4 w-auto" />}
                      label="Aktuelle Matrix Gruppe"
                      link={matrix}
                    />
                  )}
                  {discord && (
                    <ShareArea
                      icon={<DiscordIcon className="size-4" />}
                      label="Unser Fachschafts Discord Server"
                      link={discord}
                    />
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </section>
      )}

      {isRestricted && !application && (
        <section>
          <Alert
            className={"cursor-pointer bg-destructive-foreground my-4"}
            onClick={() => router.push(`${pathname}/register`)}
            variant="warning"
          >
            <CircleAlert className="size-4" />
            <AlertTitle className="font-bold">
              Registrierung erforderlich!
            </AlertTitle>
            <AlertDescription className="pr-8">
              Diese Veranstaltung ist aus Kapazitätsgründen
              zulassungsbeschränkt. Bitte nimm an einem kurzen Quiz teil, damit
              wir einschätzen können, ob du diesen Kurs benötigst.
            </AlertDescription>
            <AlertAction>
              <MoveRight className="size-4" />
            </AlertAction>
          </Alert>
        </section>
      )}

      {isRestricted && application && !accepted && (
        <section>
          <Alert className={"bg-destructive-foreground my-4"} variant="warning">
            <CircleAlert className="size-4" />
            <AlertTitle className="font-bold">
              Registrierung eingegangen!
            </AlertTitle>
            <AlertDescription className="pr-8">
              Du hast dich bereits für dieses Event registriert. Deine
              Registrierung ist eingegangen, jedoch haben wir diese noch nicht
              bearbeitet.
            </AlertDescription>
          </Alert>
        </section>
      )}

      <section className="mt-5">
        {isMobile !== undefined && (
          <EventCalendar
            events={events}
            initialView={isMobile ? "day" : "week"}
          />
        )}
      </section>
    </TooltipProvider>
  );
}

interface ShareAreaProps {
  label: string;
  link: string;
  icon: React.ReactNode;
}

function ShareArea({ label, link, icon }: ShareAreaProps) {
  return (
    <div className="items-center gap-y-2 w-[130px] flex flex-col">
      {icon}
      <p className="text-xs font-bold">{label}</p>
      <Link
        href={link}
        className="text-blue-600 hover:underline truncate w-[130px]"
      >
        {link}
      </Link>
      <QRCodeSVG value={link} />
    </div>
  );
}
