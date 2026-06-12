"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg", "image/png", "image/webp",
  "text/plain",
];

export async function uploadDocument(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;
  const name = (formData.get("name") as string) || file?.name;
  const category = (formData.get("category") as string) || "Other";

  if (!file || !file.size) throw new Error("No file provided");
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("File type not allowed");
  if (file.size > 50 * 1024 * 1024) throw new Error("File must be under 50 MB");

  const ext = file.name.split(".").pop();
  const path = `${orgId}/${projectId}/${Date.now()}_${name.replace(/[^a-z0-9]/gi, "_")}.${ext}`;

  const supabase = createServiceRoleClient();
  const { error: uploadError } = await supabase.storage
    .from("project-documents")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { error: dbError } = await supabase.from("project_documents").insert({
    project_id: projectId, organization_id: orgId,
    name, file_path: path, file_size: file.size,
    mime_type: file.type, category, uploaded_by: userId,
  });
  if (dbError) {
    await supabase.storage.from("project-documents").remove([path]);
    throw new Error(dbError.message);
  }
  revalidatePath(`/projects/${projectId}/documents`);
}

export async function deleteDocument(id: string, filePath: string, projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  await supabase.storage.from("project-documents").remove([filePath]);
  await supabase.from("project_documents").delete().eq("id", id).eq("organization_id", orgId);
  revalidatePath(`/projects/${projectId}/documents`);
}
