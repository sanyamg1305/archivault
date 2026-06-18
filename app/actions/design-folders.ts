"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDesignFolder(projectId: string, name: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  if (!name.trim()) throw new Error("Folder name is required");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("design_folders").insert({
    project_id: projectId,
    organization_id: orgId,
    name: name.trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/designs`);
}

export async function deleteDesignFolder(folderId: string, projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  // Unassign all designs in this folder first
  await supabase.from("designs").update({ folder_id: null }).eq("folder_id", folderId);
  await supabase.from("design_folders").delete().eq("id", folderId).eq("organization_id", orgId);
  revalidatePath(`/projects/${projectId}/designs`);
}

export async function renameDesignFolder(folderId: string, projectId: string, name: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("design_folders")
    .update({ name: name.trim() })
    .eq("id", folderId)
    .eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/designs`);
}

export async function moveDesignToFolder(designId: string, projectId: string, folderId: string | null) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("designs")
    .update({ folder_id: folderId })
    .eq("id", designId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/designs`);
}
