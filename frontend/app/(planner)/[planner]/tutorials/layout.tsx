"use client";

import { ManagementPageHeader } from "@/components/management-page-header";
import { RefetchProvider, useUser } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import {Event, PlannerEventsDocument} from "@/lib/gql/generated/graphql";
import {extractId, slugify} from "@/lib/utils";
import { GraduationCap } from "lucide-react";
import React, {useEffect} from "react";
import {usePathname} from "next/navigation";
import {getClient} from "@/lib/graphql";
import {defaultEvent, defaultTutorial} from "@/types/defaults";
import {toast} from "sonner";

interface ProfileTutorialsLayoutProps {
  children: React.ReactNode;
}

export default function ProfileTutorialsLayout({
  children,
}: ProfileTutorialsLayoutProps) {
  const { sid } = useUser();
  const pathname = usePathname()
  const [umbrellaID, setUmbrellaID] = React.useState<number>();
  const [events, setEvents] = React.useState<Event[]>([]);

  useEffect(() => {
    const newUmbrellaId = extractId(pathname.split('/')[1])
    if (newUmbrellaId) setUmbrellaID(newUmbrellaId)
  }, [pathname]);

  useEffect(() => {
    console.log(umbrellaID)
    const fetchEvents = async () => {
      const client = getClient(String(sid))
      if (!umbrellaID) return

      try {
        const data = await client.request(PlannerEventsDocument, {umbrellaID: umbrellaID})
        const newEvents: Event[] = data.events.map(event => ({
          ...defaultEvent,
          ...event,
          tutorials: event.tutorials?.map(t => ({...defaultTutorial, t}))
        }))
        setEvents(newEvents.filter(e => e.tutorials));
      } catch {
        toast.error('fuck')
      }
    }

    void fetchEvents()
  }, [umbrellaID]);

  const tutorials = events.map((event) => {
    const basePath = `/${pathname.split("/")[1]}/tutorials`;

    return {
      title: event.title,
      description: <>{new Date(event.from).toLocaleDateString()}</>,
      href: `${basePath}/${slugify(event.title)}-${event.ID}`,
    }
  });

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        iconNode={<GraduationCap />}
        title={"Tutorien"}
        description={"Hier findest du alle Tutorien des Programms."}
      />

      {tutorials ? (
        <div className="flex flex-col space-y-5 lg:flex-row lg:space-y-0">
          <aside>
            <SidebarNav items={tutorials ?? []} />
          </aside>
          <RefetchProvider>
            <div className="w-full lg:ml-4">{children}</div>
          </RefetchProvider>
        </div>
      ) : (
        <div className={"w-full p-10 text-center"}>
          Dieses Programm hat noch keine Events mit Tutorien
        </div>
      )}
    </div>
  );
}
