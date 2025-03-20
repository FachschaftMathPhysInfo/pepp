"use client";

import EventDialog from "@/components/event-dialog/event-dialog";
import { Footer } from "@/components/footer";
import { PlannerHeader } from "@/components/planner-selection";
import { useUser } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { Role } from "@/lib/gql/generated/graphql";

interface PlannerLayoutProps {
  children: React.ReactNode;
}

const adminNav = [
  {
    title: "Stundenplan",
    href: "/",
  },
  {
    title: "Überblick",
    href: "/overview",
  },
  {
    title: "Veranstaltungen",
    href: "/events",
  },
  {
    title: "Tutorien",
    href: "/tutorials",
  },
  {
    title: "Anmeldungen",
    href: "/applications",
  },
  {
    title: "Einstellungen",
    href: "/settings",
  },
];

export default function PlannerLayout({ children }: PlannerLayoutProps) {
  const { user } = useUser();
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 mt-[100px] space-y-4 pl-6 pr-6">
        <PlannerHeader />
        <EventDialog />
        {user?.role === Role.Admin ? (
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 w-1/5">
              <SidebarNav items={adminNav} />
            </aside>
            <div className="flex-1">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}
