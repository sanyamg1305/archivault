"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteDesign(designId: string, projectId: string) {
  const { userId, orgRole } = await auth();
  if (!userId || orgRole !== "org:admin") throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  // Delete all storage files for this design's versions
  const { data: versions } = await supabase
    .from("design_versions")
    .select("file_path")
    .eq("design_id", designId);

  if (versions?.length) {
    await supabase.storage.from("designs").remove(versions.map((v) => v.file_path));
  }

  const { error } = await supabase.from("designs").delete().eq("id", designId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/designs`);
}

export async function uploadDesign(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  const projectId = formData.get("projectId") as string;
  let roomId = formData.get("roomId") as string | null;
  if (roomId === "none") roomId = null;
  const title = formData.get("title") as string;
  const file = formData.get("file") as File;
  const changeNotes = formData.get("changeNotes") as string;

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Only images and PDFs are allowed.");
  if (file.size > MAX_SIZE) throw new Error("File must be under 20 MB.");

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
  const supabase = createServiceRoleClient();

  const designId = formData.get("designId") as string;
  const projectId = formData.get("projectId") as string;
  const file = formData.get("file") as File;
  const changeNotes = formData.get("changeNotes") as string;
  const nextVersion = Number(formData.get("nextVersion"));

  const fileExt = file.name.split('.').pop();
  const filePath = `${orgId}/${projectId}/${designId}/v${nextVersion}.${fileExt}`;

  const { error: storageErr } = await supabase.storage.from("designs").upload(filePath, file);
  if (storageErr) throw new Error(storageErr.message);

  // Supersede any prior versions that are still awaiting client action
  await supabase
    .from("design_versions")
    .update({ status: "Superseded" })
    .eq("design_id", designId)
    .in("status", ["Pending", "Revision Requested"]);

  const { error: versionErr } = await supabase.from("design_versions").insert({
    design_id: designId,
    file_path: filePath,
    version_number: nextVersion,
    change_notes: changeNotes,
    created_by: userId
  });
  if (versionErr) throw new Error(versionErr.message);

  revalidatePath(`/projects/${projectId}/designs`);
  revalidatePath(`/projects/${projectId}`, "layout");
}
