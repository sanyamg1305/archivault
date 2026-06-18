"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFloor(projectId: string, name: string, sortOrder: number) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  if (!name.trim()) throw new Error("Floor name is required");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("floors").insert({
    project_id: projectId,
    organization_id: orgId,
    name: name.trim(),
    sort_order: sortOrder,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/rooms`);
}

export async function renameFloor(floorId: string, projectId: string, name: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("floors")
    .update({ name: name.trim() })
    .eq("id", floorId)
    .eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/rooms`);
}

export async function deleteFloor(floorId: string, projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  // Unassign rooms on this floor first
  await supabase.from("rooms").update({ floor_id: null }).eq("floor_id", floorId);
  await supabase.from("floors").delete().eq("id", floorId).eq("organization_id", orgId);
  revalidatePath(`/projects/${projectId}/rooms`);
}
