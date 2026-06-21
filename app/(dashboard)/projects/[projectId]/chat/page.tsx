import { auth, clerkClient } from "@clerk/nextjs/server";
import { Lock, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getMessages } from "@/app/actions/messages";
import { createServiceRoleClient } from "@/utils/supabase/server";

export default async function ProjectChatPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) return null;
  const isAdmin = orgRole === "org:admin";

  const supabase = createServiceRoleClient();
  const clerk = await clerkClient();

  const [{ data: project }, { data: vendors }, internalMessages, externalMessages, membershipsResult] = await Promise.all([
    supabase.from("projects").select("name, client_reference").eq("id", projectId).single(),
    supabase.from("vendors").select("id, name, category, phone, email").eq("organization_id", orgId).order("name"),
    getMessages(projectId, "internal"),
    getMessages(projectId, "external"),
    clerk.organizations.getOrganizationMembershipList({ organizationId: orgId, limit: 50 }),
  ]);

  const members = (membershipsResult?.data ?? []).map((m: any) => ({
    id: m.publicUserData?.userId ?? "",
    name: [m.publicUserData?.firstName, m.publicUserData?.lastName].filter(Boolean).join(" ") ||
      m.publicUserData?.identifier || "Member",
  })).filter((m: any) => m.id);

  return (
    <div className="flex flex-col -m-8 h-[calc(100vh-10rem)]">
      <div className="px-6 pt-6 pb-3 border-b shrink-0">
        <h1 className="text-xl font-semibold">Chat</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{project?.name}</p>
      </div>

      <Tabs defaultValue="internal" className="flex flex-col flex-1 min-h-0">
        <TabsList className="mx-6 mt-3 shrink-0 w-fit">
          <TabsTrigger value="internal" className="gap-2">
            <Lock className="h-3.5 w-3.5" />
            Team (Internal)
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-2">
            <Users className="h-3.5 w-3.5" />
            Client Chat
            {project?.client_reference && (
              <span className="text-xs text-muted-foreground">
                — {project.client_reference}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="flex-1 min-h-0 mt-0">
          <ChatPanel
            projectId={projectId}
            channel="internal"
            initialMessages={internalMessages}
            vendors={vendors ?? []}
            isAdmin={isAdmin}
            members={members}
          />
        </TabsContent>

        <TabsContent value="external" className="flex-1 min-h-0 mt-0">
          <ChatPanel
            projectId={projectId}
            channel="external"
            initialMessages={externalMessages}
            vendors={vendors ?? []}
            isAdmin={isAdmin}
            members={members}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
