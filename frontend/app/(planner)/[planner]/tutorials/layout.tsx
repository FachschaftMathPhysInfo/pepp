"use client";

import {ManagementPageHeader} from "@/components/management-page-header";
import {RefetchProvider, useUser} from "@/components/providers";
import {SidebarNav} from "@/components/sidebar-nav";
import {EventsOfUmbrellaDocument} from "@/lib/gql/generated/graphql";
import {extractId, slugify} from "@/lib/utils";
import {GraduationCap} from "lucide-react";
import React, {useCallback, useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {getClient} from "@/lib/graphql";

interface ProfileTutorialsLayoutProps {
  children: React.ReactNode;
}

export default function UmbrellaTutorialsLayout({
                                                  children,
                                                }: ProfileTutorialsLayoutProps) {
  const {sid} = useUser();
  const pathname = usePathname();
  const umbrellaID = extractId(pathname);
  const [events, setEvents] = useState<{
    title: string;
    description: React.JSX.Element;
    href: string;
  }[]>([])

  const fetchEvents = useCallback(async () => {
    if (!umbrellaID) return;

    const client = getClient(sid!);
    const eventData = await client.request(EventsOfUmbrellaDocument, {umbrellaIDs: [umbrellaID]})

    const eventInfos = eventData.events.map((event) => ({
      title: event.title,
      description: <>{new Date(event.from).toLocaleDateString()}</>,
      href: `/profile/tutorials/${slugify(event.title)}-${event.ID}`,
    }));

    setEvents(eventInfos);

  }, [umbrellaID]);

  useEffect(() => {
    void fetchEvents()
  }, [umbrellaID])


  return (
    <div className="space-y-6">
      <ManagementPageHeader
        iconNode={<GraduationCap/>}
        title={"Tutorien"}
        description={"Hier findest du alle Tutorien dieses Programms."}
      />

      {events ? (
        <div className="flex flex-col space-y-5 lg:flex-row lg:space-y-0">
          <aside>
            <SidebarNav items={events ?? []}/>
          </aside>
          <RefetchProvider>
            <div className="w-full lg:ml-4">{children}</div>
          </RefetchProvider>
        </div>
      ) : (
        <div className={"w-full p-10 text-center"}>
          Dieses Programm scheint noch keine Tutorien zu haben
        </div>
      )}
    </div>
  );
}
