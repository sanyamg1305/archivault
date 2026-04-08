import { auth } from "@clerk/nextjs/server"
import { ClientSidebar } from "@/components/client-sidebar"
import { OrganizationGuard } from "@/components/auth/org-guard"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { TooltipProvider } from "@/components/ui/tooltip"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { orgId } = await auth()

  if (!orgId) {
    return <OrganizationGuard />
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          {/* Top bar */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="font-semibold text-sm">Client Portal</h1>
          </header>

          {/* Content area */}
          <main className="flex-1 overflow-auto bg-muted/20">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
