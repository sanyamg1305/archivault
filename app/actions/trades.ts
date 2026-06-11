"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ── Trade workers ──────────────────────────────────────────────────────────

export async function createTrade(data: {
  name: string;
  trade_type: string;
  phone?: string;
  email?: string;
  notes?: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("trades").insert({
    organization_id: orgId,
    name: data.name,
    trade_type: data.trade_type,
    phone: data.phone || null,
    email: data.email || null,
    notes: data.notes || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/trades");
}

export async function updateTrade(
  tradeId: string,
  data: { name: string; trade_type: string; phone?: string; email?: string; notes?: string }
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("trades")
    .update({ name: data.name, trade_type: data.trade_type, phone: data.phone || null, email: data.email || null, notes: data.notes || null })
    .eq("id", tradeId)
    .eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/trades");
}

export async function deleteTrade(tradeId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("trades").delete().eq("id", tradeId).eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/trades");
}

// ── Trade tasks ───────────────────────────────────────────────────────────

export async function createTradeTask(data: {
  projectId: string;
  roomId?: string | null;
  tradeId?: string | null;
  title: string;
  description?: string;
  dueDate?: string | null;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("trade_tasks").insert({
    organization_id: orgId,
    project_id: data.projectId,
    room_id: data.roomId || null,
    trade_id: data.tradeId || null,
    title: data.title,
    description: data.description || null,
    due_date: data.dueDate || null,
    created_by: userId,
    status: "Pending",
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${data.projectId}/tasks`);
}

export async function updateTradeTaskStatus(
  taskId: string,
  projectId: string,
  status: string
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("trade_tasks")
    .update({
      status,
      ...(status === "Completed" ? { completed_at: new Date().toISOString() } : { completed_at: null }),
    })
    .eq("id", taskId)
    .eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/tasks`);
}

export async function deleteTradeTask(taskId: string, projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("trade_tasks").delete().eq("id", taskId).eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/tasks`);
}
