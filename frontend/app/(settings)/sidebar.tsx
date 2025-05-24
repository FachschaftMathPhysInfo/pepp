"use client";

import {
  BookCheck,
  CalendarCheck2,
  GraduationCap,
  Mail,
  School,
  Settings, Umbrella,
  Users,
} from "lucide-react";

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
import { useUser } from "@/components/providers";
import { Role } from "@/lib/gql/generated/graphql";
import { useRouter } from "next/navigation";

export function ProfileSidebar() {
  const { user } = useUser();
  const router = useRouter();

  const userItems = [
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

  const adminItems = [
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
      url: "/admin/rooms",
      icon: School,
    },
    {
      title: "Programme",
      url: "/admin/umbrellas",
      icon: Umbrella,
    }
  ];

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
