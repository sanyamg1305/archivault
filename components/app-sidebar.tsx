"use client"

import * as React from "react"
import { LayoutDashboard, FolderKanban, Users, Settings, Building2 } from "lucide-react"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-2 overflow-hidden">
        {isCollapsed ? (
          /* Icon-only placeholder when sidebar is collapsed */
          <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "w-full flex items-center justify-center",
                organizationSwitcherTrigger:
                  "w-full px-2 py-1.5 border rounded-md truncate",
              },
            }}
          />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(item.url + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4 flex flex-row items-center gap-3 overflow-hidden">
        {/* showName only when expanded — no space in icon mode */}
        <UserButton showName={!isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  )
}
