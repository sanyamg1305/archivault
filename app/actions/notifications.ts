"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createNotification(orgId: string, data: {
  title: string; body?: string; link?: string;
}) {
  const supabase = createServiceRoleClient();
  await supabase.from("notifications").insert({
    organization_id: orgId, title: data.title,
    body: data.body || null, link: data.link || null,
  });
}

export async function getNotifications() {
  const { orgId } = await auth();
  if (!orgId) return [];
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function markAllRead() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return;
  const supabase = createServiceRoleClient();
  // Fetch unread notifications for this org where user hasn't read
  const { data: unread } = await supabase
    .from("notifications")
    .select("id, read_by")
    .eq("organization_id", orgId);

  for (const n of unread ?? []) {
    if (!(n.read_by ?? []).includes(userId)) {
      await supabase.from("notifications")
        .update({ read_by: [...(n.read_by ?? []), userId] })
        .eq("id", n.id);
    }
  }
  revalidatePath("/dashboard");
}

export async function markOneRead(id: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return;
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("notifications").select("read_by").eq("id", id).single();
  if (!data) return;
  const readBy: string[] = data.read_by ?? [];
  if (!readBy.includes(userId)) {
    await supabase.from("notifications").update({ read_by: [...readBy, userId] }).eq("id", id);
  }
  revalidatePath("/dashboard");
}
