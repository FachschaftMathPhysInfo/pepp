"use client";

import { useUser } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import {slugify} from "@/lib/utils";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";

interface ProfileTutorialsLayoutProps {
  children: React.ReactNode;
}

export default function ProfileTutorialsLayout({children}: ProfileTutorialsLayoutProps) {
  const router = useRouter()

  const { user } = useUser();
  const tutorials = user?.tutorials?.map((u) => ({
    title: u.event.title,
    href: `/profile/tutorials/${slugify(u.event.title)}-${u.event.ID}`,
  }));

  useEffect(() => {
    if (tutorials?.length) {
      router.push(tutorials[0].href)
    }
  }, [tutorials])

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
          <div className="w-full lg:ml-4">{children}</div>
        </div>
      ) : (
        <p>Dir wurden noch keine Tutorien zugewiesen.</p>
      )}
    </div>
  );
}
