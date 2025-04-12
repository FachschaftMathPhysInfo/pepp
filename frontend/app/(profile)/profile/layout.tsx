"use client"

import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/sidebar-nav";
import {useUser} from "@/components/providers";
import {profileNavItems} from "@/components/header";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const {user} = useUser()
  return (
    <>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <div className="mt-[70px] space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Hi {user?.fn}!</h2>
          <p className="text-muted-foreground">
            Verwalte deine Tutorien, Anmeldungen und Einstellungen.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={profileNavItems} />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
