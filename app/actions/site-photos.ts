"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadSitePhoto(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;
  const roomId = (formData.get("roomId") as string) || null;
  const caption = (formData.get("caption") as string) || null;
  const takenAt = (formData.get("taken_at") as string) || new Date().toISOString().split("T")[0];

  if (!file || !file.size) throw new Error("No file provided");
  if (!["image/jpeg", "image/png", "image/webp", "image/heic"].includes(file.type))
    throw new Error("Only JPEG, PNG, WebP or HEIC images allowed");
  if (file.size > 20 * 1024 * 1024) throw new Error("File must be under 20 MB");

  const ext = file.name.split(".").pop();
  const path = `${orgId}/${projectId}/${Date.now()}.${ext}`;

  const supabase = createServiceRoleClient();
  const { error: uploadError } = await supabase.storage
    .from("site-photos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error: dbError } = await supabase.from("site_photos").insert({
    project_id: projectId, room_id: roomId, organization_id: orgId,
    file_path: path, caption, taken_at: takenAt, uploaded_by: userId,
  });
  if (dbError) {
    await supabase.storage.from("site-photos").remove([path]);
    throw new Error(dbError.message);
  }
  revalidatePath(`/projects/${projectId}/progress`);
}

export async function deleteSitePhoto(id: string, filePath: string, projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  await supabase.storage.from("site-photos").remove([filePath]);
  await supabase.from("site_photos").delete().eq("id", id).eq("organization_id", orgId);
  revalidatePath(`/projects/${projectId}/progress`);
}
