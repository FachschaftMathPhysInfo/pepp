"use client";

import { useUser } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
import { AdminSidebar } from "./sidebar";
import { Footer } from "@/components/footer";

interface PlannerLayoutProps {
  children: React.ReactNode;
}

export default function PlannerLayout({ children }: PlannerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [umbrellas, setUmbrellas] = useState<Event[]>([]);

  const basePath = "/" + pathname.split("/")[1];

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
    <>
      {user?.role === Role.Admin ? (
        <SidebarProvider>
          <AdminSidebar umbrellas={umbrellas} />
          <main className="flex-1 mt-[80px]">
            <div className="p-5">
              <SidebarTrigger className="mb-2" />
              {children}
            </div>
            <Footer />
          </main>
        </SidebarProvider>
      ) : (
        <main className="space-y-5 p-5 mt-[80px]">
          <UmbrellaPopoverSelection
            umbrellas={umbrellas}
            className="text-4xl font-bold"
          />
          {children}
        </main>
      )}
    </>
  );
}
