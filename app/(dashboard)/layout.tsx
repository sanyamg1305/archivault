import { auth } from "@clerk/nextjs/server"
import { AppSidebar } from "@/components/app-sidebar"
import { OrganizationGuard } from "@/components/auth/org-guard"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { getNotifications } from "@/app/actions/notifications"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { orgId, userId } = await auth()

  if (!orgId) return <OrganizationGuard />

  const notifications = await getNotifications()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <KeyboardShortcuts />
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <DynamicBreadcrumb />
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Search (⌘K)" asChild>
                <Link href="/search">
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
              <NotificationBell notifications={notifications} userId={userId ?? ""} />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
