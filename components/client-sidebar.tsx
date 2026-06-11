"use client"

import * as React from "react"
import { Home, CheckCircle, LayoutDashboard, Building2, Box, ArrowLeft, MessageCircle } from "lucide-react"
import { OrganizationSwitcher, UserButton, useOrganization } from "@clerk/nextjs"
import { usePathname, useParams } from "next/navigation"
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
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ClientSidebar({ projects = [] }: { projects?: any[] }) {
  const pathname = usePathname()
  const params = useParams()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const projectId = params.projectId as string || ""
  const { membership } = useOrganization()
  const isAdmin = membership?.role === "org:admin"

  const navItems = [
    { title: "Dashboard", url: `/portal/${projectId}/dashboard`, icon: LayoutDashboard },
    { title: "Action Center", url: `/portal/${projectId}/action-center/design-approvals`, icon: CheckCircle },
    { title: "Rooms", url: `/portal/${projectId}/rooms`, icon: Box },
    { title: "Chat", url: `/portal/${projectId}/chat`, icon: MessageCircle },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="min-h-16 py-3 flex items-center justify-center px-3 overflow-hidden">
        {isCollapsed ? (
          <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <div className="w-full flex flex-col gap-2.5">
            <OrganizationSwitcher
              hidePersonal
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger:
                    "w-full flex justify-between px-2 py-1.5 border rounded-md text-sm bg-background",
                },
              }}
            />
            {projects.length > 1 ? (
              <Select 
                value={projectId} 
                onValueChange={(val) => {
                  if(val && val !== projectId) {
                    window.location.href = `/portal/${val}/dashboard`
                  }
                }}
              >
                <SelectTrigger className="w-full bg-background h-8 text-xs">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full px-2 py-1 border rounded-md truncate text-xs font-medium bg-background text-center text-muted-foreground">
                {projects[0]?.name || "My Project"}
              </div>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectId && navItems.map((item) => (
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
        {isAdmin && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Back to Dashboard</span>}
          </Link>
        )}
        <UserButton showName={!isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  )
}
