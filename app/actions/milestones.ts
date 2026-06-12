"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMilestone(projectId: string, data: {
  title: string; description?: string; target_date?: string; sort_order?: number;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("project_milestones").insert({
    project_id: projectId, organization_id: orgId,
    title: data.title, description: data.description || null,
    target_date: data.target_date || null, sort_order: data.sort_order ?? 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/timeline`);
}

export async function toggleMilestone(id: string, projectId: string, completed: boolean) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("project_milestones")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id).eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/timeline`);
}

export async function deleteMilestone(id: string, projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  await supabase.from("project_milestones").delete().eq("id", id).eq("organization_id", orgId);
  revalidatePath(`/projects/${projectId}/timeline`);
}
