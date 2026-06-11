import { auth } from "@clerk/nextjs/server";

import { ChatPanel } from "@/components/chat/chat-panel";
import { getMessages } from "@/app/actions/messages";
import { createServiceRoleClient } from "@/utils/supabase/server";

export default async function ClientChatPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServiceRoleClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, client_reference")
    .eq("id", projectId)
    .single();

  const messages = await getMessages(projectId, "external");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 pt-6 pb-3 border-b shrink-0">
        <h1 className="text-xl font-semibold">Chat with Your Architect</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{project?.name}</p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatPanel
          projectId={projectId}
          channel="external"
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
