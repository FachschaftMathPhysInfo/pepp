import { BookCheck, Calendar, GraduationCap } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UmbrellaPopoverSelection } from "@/components/umbrella-popover-selection";
import { Event } from "@/lib/gql/generated/graphql";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  umbrellas: Event[];
}

export function AdminSidebar({ umbrellas }: AdminSidebarProps) {
  const pathname = usePathname();

  const basePath = "/" + pathname.split("/")[1];

  const items = [
    {
      title: "Stundenplan",
      url: basePath,
      icon: Calendar,
    },
    {
      title: "Tutorien",
      url: basePath + "/tutorials",
      icon: GraduationCap,
    },
    {
      title: "Anmeldungen",
      url: basePath + "/registrations",
      icon: BookCheck,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <UmbrellaPopoverSelection
              umbrellas={umbrellas}
              className="w-full justify-between"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
