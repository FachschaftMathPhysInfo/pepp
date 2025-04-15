import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileSidebar } from "./sidebar";
import { Footer } from "@/components/footer";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <SidebarProvider>
      <ProfileSidebar />
      <main className="flex-1 mt-[80px]">
        <div className="p-5">
          <SidebarTrigger className="mb-2" />
          {children}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
}
