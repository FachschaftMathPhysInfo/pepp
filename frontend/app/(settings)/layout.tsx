import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileSidebar } from "./sidebar";
import { Footer } from "@/components/footer";
import React from "react";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <SidebarProvider>
      <ProfileSidebar />
      <div className="flex flex-col min-h-[calc(100vw-80px]] mt-[80px] w-full">
        <main className="flex-1">
          <div className="p-5">
            <SidebarTrigger className="mb-2" />
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
