"use client";

import {
  Event,
  Role,
  UmbrellasDocument,
  UmbrellasQuery,
  UmbrellasQueryVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { getClient } from "@/lib/graphql";
import { UmbrellaPopoverSelection } from "@/components/umbrella-popover-selection";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUmbrella, useUser } from "./providers";

type Tab = {
  title: string;
  value:
    | "planner"
    | "overview"
    | "events"
    | "tutorials"
    | "applications"
    | "settings";
};

const tabs: Tab[] = [
  {
    title: "Stundenplan",
    value: "planner",
  },
  {
    title: "Überblick",
    value: "overview",
  },
  {
    title: "Veranstaltungen",
    value: "events",
  },
  {
    title: "Tutorien",
    value: "tutorials",
  },
  {
    title: "Anmeldungen",
    value: "applications",
  },
  {
    title: "Einstellungen",
    value: "settings",
  },
];

export function PlannerHeader() {
  const { user } = useUser();
  const { umbrellaID, setUmbrellaID } = useUmbrella();
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      const client = getClient()

      const vars: UmbrellasQueryVariables = {
        onlyFuture: true,
      };

      const umbrellaData = await client.request<UmbrellasQuery>(
        UmbrellasDocument,
        vars
      );

      if (umbrellaData.umbrellas.length) {
        setUmbrellas(
          umbrellaData.umbrellas.map((u) => ({
            ID: u.ID,
            title: u.title,
            needsTutors: false,
            type: { name: "" },
            topic: { name: "" },
            from: 0,
            to: 0,
          }))
        );

        if (!umbrellaID) setUmbrellaID(umbrellaData.umbrellas[0].ID);
      }
    };

    fetchData();
  }, [umbrellaID]);

  const handleTabClick = (dest: string) => {
    router.push(dest + "?e=" + umbrellaID);
  };

  return (
    <section className="lg:flex lg:flex-row lg:items-end">
      <UmbrellaPopoverSelection umbrellas={umbrellas}>
        <Button
          variant="outline"
          role="combobox"
          className="w-auto h-auto justify-between text-4xl font-bold"
        >
          {umbrellas.find((u) => u.ID == umbrellaID)?.title ??
            "Event auswählen..."}
          <ChevronsUpDown className="ml-8 h-7 w-7 shrink-0 opacity-40" />
        </Button>
      </UmbrellaPopoverSelection>
      {user?.role === Role.Admin && (
        <>
          <div className="lg:w-full" />
          <Tabs
            defaultValue={
              pathname.length - 1
                ? pathname.slice(1, pathname.length)
                : "planner"
            }
            className="md:mt-4"
          >
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  onClick={() =>
                    handleTabClick(t.value === "planner" ? "/" : "/" + t.value)
                  }
                >
                  {t.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </>
      )}
    </section>
  );
}
