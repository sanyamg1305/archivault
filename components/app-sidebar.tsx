"use client"

import * as React from "react"
import { LayoutDashboard, FolderKanban, Users, Settings, Building2, HardHat, Store, LifeBuoy, UserRound } from "lucide-react"
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
  { title: "Vendors", url: "/vendors", icon: Store },
  { title: "Team", url: "/team", icon: Users },
  { title: "Clients", url: "/clients", icon: UserRound },
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

      <SidebarFooter className="border-t p-4 flex flex-col gap-3 overflow-hidden">
        <a
          href="mailto:support@archivault.in"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="support@archivault.in"
        >
          <LifeBuoy className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Support</span>}
        </a>
        <UserButton showName={!isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  )
}
