"use client";

import { useUser } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { UmbrellaPopoverSelection } from "@/components/umbrella-popover-selection";
import {
  Event,
  Role,
  UmbrellasDocument,
  UmbrellasQuery,
  UmbrellasQueryVariables,
} from "@/lib/gql/generated/graphql";
import { getClient } from "@/lib/graphql";
import { slugify } from "@/lib/utils";
import { defaultEvent } from "@/types/defaults";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PlannerLayoutProps {
  children: React.ReactNode;
}

export default function PlannerLayout({ children }: PlannerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);

  const basePath = "/" + pathname.split("/")[1]

  const adminNav = [
    {
      title: "Stundenplan",
      href: basePath,
    },
    {
      title: "Überblick",
      href: basePath + "/overview",
    },
    {
      title: "Veranstaltungen",
      href: basePath + "/events",
    },
    {
      title: "Anmeldungen",
      href: basePath + "/applications",
    },
    {
      title: "Einstellungen",
      href: basePath + "/settings",
    },
  ];

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
        if (pathname === "/") {
          const umbrella = umbrellaData.umbrellas[0];
          router.push("/" + slugify(umbrella.title) + "-" + umbrella.ID);
        }
        setUmbrellas(
          umbrellaData.umbrellas.map((u) => ({ ...defaultEvent, ...u }))
        );
      }
    };

    fetchData();
  }, [basePath]);

  return (
    <div className="flex flex-col pt-[100px]">
      <main className="flex-1 space-y-4 pl-6 pr-6">
        {user?.role === Role.Admin ? (
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 w-1/5 space-y-4">
              <UmbrellaPopoverSelection umbrellas={umbrellas} />
              <SidebarNav items={adminNav} />
            </aside>
            <div className="flex-1">{children}</div>
          </div>
        ) : (
          <>
            <UmbrellaPopoverSelection umbrellas={umbrellas} heading={true} />
            {children}
          </>
        )}
      </main>
    </div>
  );
}
