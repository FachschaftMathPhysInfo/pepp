"use client";

import { ManagementPageHeader } from "@/components/management-page-header";
import { RefetchProvider, useUser } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { Tutorial } from "@/lib/gql/generated/graphql";
import { slugify } from "@/lib/utils";
import { GraduationCap } from "lucide-react";
import React from "react";

interface ProfileTutorialsLayoutProps {
  children: React.ReactNode;
}

export default function ProfileTutorialsLayout({
  children,
}: ProfileTutorialsLayoutProps) {
  const { user } = useUser();
  const reducedEvents = user?.tutorials?.reduce(
    (acc: Tutorial[], curr: Tutorial) => {
      if (!acc.some((tutorial) => tutorial.event.ID === curr.event.ID)) {
        acc.push(curr);
      }
      return acc;
    },
    []
  );

  const tutorials = reducedEvents?.map((u) => ({
    title: u.event.title,
    description: <>{new Date(u.event.from).toLocaleDateString()}</>,
    href: `/profile/tutorials/${slugify(u.event.title)}-${u.event.ID}`,
  }));

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        iconNode={<GraduationCap />}
        title={"Meine Tutorien"}
        description={"Hier findest du alle dir zugewiesenen Tutorien."}
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
          Dir wurden noch keine Tutorien zugewiesen.
        </div>
      )}
    </div>
  );
}
