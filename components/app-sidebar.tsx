"use client"

import * as React from "react"
import { LayoutDashboard, FolderKanban, Users, Settings, Building2, HardHat } from "lucide-react"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

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
  { title: "Trades", url: "/trades", icon: HardHat },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col items-center border-b px-2 pt-4 pb-3 overflow-hidden gap-3">
        {isCollapsed ? (
          <Building2 className="h-5 w-5 shrink-0 text-primary" />
        ) : (
          <>
            <Image src="/logo.png" alt="ArchiVault" width={120} height={40} className="object-contain" priority />
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: "w-full flex items-center justify-center",
                  organizationSwitcherTrigger: "w-full px-2 py-1.5 border rounded-md truncate",
                },
              }}
            />
          </>
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
