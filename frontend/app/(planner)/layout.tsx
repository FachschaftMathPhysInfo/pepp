"use client";

import { useUser } from "@/components/providers";
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
import React, { useEffect, useState } from "react";
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

    void fetchData();
  }, [basePath]);

  return (
    <div className={'flex flex-col min-h-[calc(100vh-80px)] mt-[80px] w-full'}>
      {user?.role === Role.Admin ? (
        <SidebarProvider>
          <AdminSidebar umbrellas={umbrellas} />
          <main className="flex-1">
            <div className="p-5">
              <SidebarTrigger className="mb-2 block" />
              {children}
            </div>
            <Footer />
          </main>
        </SidebarProvider>
      ) : (
        <main>
          <div className="space-y-5 p-5">
            {umbrellas.length > 0 && (
              <UmbrellaPopoverSelection
                umbrellas={umbrellas}
                className="text-4xl font-bold"
              />
            )}
            {children}
          </div>
          <Footer />
        </main>
      )}
    </div>
  );
}
