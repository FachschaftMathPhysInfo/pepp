"use client";

import {
  BookCheck,
  CalendarCheck2,
  Fingerprint,
  Globe,
  GraduationCap,
  Mail,
  School,
  Settings,
  Tags,
  Umbrella,
  Users,
} from "lucide-react";

export const userItems = [
  {
    title: "Einstellungen",
    url: "/profile",
    icon: Settings,
  },
  {
    title: "Meine Anmeldungen",
    url: "/profile/registrations",
    icon: BookCheck,
  },
  {
    title: "Meine Tutorien",
    url: "/profile/tutorials",
    icon: GraduationCap,
  },
  {
    title: "Meine Verfügbarkeiten",
    url: "/profile/availabilities",
    icon: CalendarCheck2,
  },
];

export const adminItems = [
  {
    title: "E-Mails",
    url: "/admin/mails",
    icon: Mail,
  },
  {
    title: "Nutzerverwaltung",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Räume & Gebäude",
    url: "/admin/locations",
    icon: School,
  },
  {
    title: "Programme",
    url: "/admin/umbrellas",
    icon: Umbrella,
  },
  {
    title: "Labels",
    url: "/admin/labels",
    icon: Tags,
  },
  {
    title: "Kontakt",
    url: "/admin/social",
    icon: Globe,
  },
  {
    title: "Authentifizierung",
    url: "/admin/auth",
    icon: Fingerprint,
  },
];

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Role } from "@/lib/gql/generated/graphql";
import { useRouter } from "next/navigation";
import {useUser} from "@/components/provider/user-provider";

export function ProfileSidebar() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => router.push(item.url)}
                    className="cursor-pointer"
                  >
                    <div>
                      <item.icon />
                      {item.title}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user?.role === Role.Admin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => router.push(item.url)}
                      className="cursor-pointer"
                    >
                      <div>
                        <item.icon />
                        {item.title}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
