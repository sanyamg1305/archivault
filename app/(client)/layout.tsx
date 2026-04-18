import { auth } from "@clerk/nextjs/server"
import { createClerkSupabaseClient } from "@/utils/supabase/server"
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
  const { orgId, userId } = await auth()

  if (!orgId || !userId) {
    return <OrganizationGuard />
  }

  const supabase = await createClerkSupabaseClient()
  
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", orgId)
    .eq("client_id", userId as string)

  return (
    <TooltipProvider>
      <SidebarProvider>
        <ClientSidebar projects={projects || []} />
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
