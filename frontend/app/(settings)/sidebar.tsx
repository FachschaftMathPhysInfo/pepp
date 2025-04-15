"use client";

import {
  BookCheck,
  CalendarCheck2,
  GraduationCap,
  Mail,
  School,
  Settings,
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

export function ProfileSidebar() {
  const { user } = useUser();

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
      url: "/profile/registrations",
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
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
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
