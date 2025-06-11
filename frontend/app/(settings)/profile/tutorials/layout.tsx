"use client";

import { RefetchProvider, useUser } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { Tutorial } from "@/lib/gql/generated/graphql";
import { slugify } from "@/lib/utils";
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
    <div className="">
      <div>
        <h3 className="text-lg font-medium">Tutorien</h3>
        <p className="text-sm text-muted-foreground">
          Hier findest du alle dir zugewiesenen Tutorien.
        </p>
      </div>
      <Separator className="my-6" />
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
        <p>Dir wurden noch keine Tutorien zugewiesen.</p>
      )}
    </div>
  );
}
