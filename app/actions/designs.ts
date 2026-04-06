"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadDesign(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = await createClerkSupabaseClient();

  const projectId = formData.get("projectId") as string;
  let roomId = formData.get("roomId") as string | null;
  if (roomId === "none") roomId = null;
  const title = formData.get("title") as string;
  const file = formData.get("file") as File;
  const changeNotes = formData.get("changeNotes") as string;

  // 1. Create the Design record
  const { data: design, error: designErr } = await supabase
    .from("designs")
    .insert({ project_id: projectId, room_id: roomId, title })
    .select().single();

  if (designErr) throw new Error(designErr.message);

  // 2. Upload File to Storage
  const fileExt = file.name.split('.').pop();
  const filePath = `${orgId}/${projectId}/${design.id}/v1.${fileExt}`;

  const { error: storageErr } = await supabase.storage
    .from("designs")
    .upload(filePath, file);

  if (storageErr) throw new Error(storageErr.message);

  // 3. Create Version 1
  await supabase.from("design_versions").insert({
    design_id: design.id,
    file_path: filePath,
    version_number: 1,
    change_notes: changeNotes || "Initial upload",
    created_by: userId
  });

  revalidatePath(`/projects/${projectId}/designs`);
}

export async function uploadNewVersion(formData: FormData) {
  const { userId, orgId } = await auth();
  const supabase = await createClerkSupabaseClient();

  const designId = formData.get("designId") as string;
  const projectId = formData.get("projectId") as string;
  const file = formData.get("file") as File;
  const changeNotes = formData.get("changeNotes") as string;
  const nextVersion = Number(formData.get("nextVersion"));

  const fileExt = file.name.split('.').pop();
  const filePath = `${orgId}/${projectId}/${designId}/v${nextVersion}.${fileExt}`;

  await supabase.storage.from("designs").upload(filePath, file);

  await supabase.from("design_versions").insert({
    design_id: designId,
    file_path: filePath,
    version_number: nextVersion,
    change_notes: changeNotes,
    created_by: userId
  });

  revalidatePath(`/projects/${projectId}/designs`);
}
