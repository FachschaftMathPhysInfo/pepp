"use client";

import {
  Event,
  UmbrellasDocument,
  UmbrellasQuery,
  UmbrellasQueryVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getClient } from "@/lib/graphql";
import { UmbrellaPopoverSelection } from "@/components/umbrella-popover-selection";
import { useUmbrella } from "./providers";

export function PlannerHeader() {
  const { umbrellaID, setUmbrellaID } = useUmbrella();
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const client = getClient();

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
    </section>
  );
}
