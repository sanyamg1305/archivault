"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  channel: "internal" | "external";
  created_at: string;
};

export async function getMessages(
  projectId: string,
  channel: "internal" | "external"
): Promise<Message[]> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return [];

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("project_messages")
    .select("id, sender_id, sender_name, content, channel, created_at")
    .eq("project_id", projectId)
    .eq("channel", channel)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
}

export async function sendMessage(
  projectId: string,
  channel: "internal" | "external",
  content: string,
  senderName: string
): Promise<void> {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  // For external channel clients have no orgId — allow if they have userId
  if (channel === "internal" && !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    sender_id: userId,
    sender_name: senderName,
    content: content.trim(),
    channel,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/chat`);
  revalidatePath(`/portal/${projectId}/chat`);
}
