import { auth } from "@clerk/nextjs/server"
import { AppSidebar } from "@/components/app-sidebar"
import { OrganizationGuard } from "@/components/auth/org-guard"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { getNotifications } from "@/app/actions/notifications"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { orgId, userId } = await auth()

  if (!orgId) return <OrganizationGuard />

  const notifications = await getNotifications()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <DynamicBreadcrumb />
            <div className="ml-auto">
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
