"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMoodBoardImage(formData: FormData) {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const projectId = formData.get("projectId") as string;
  const roomId = (formData.get("roomId") as string) || null;
  const title = (formData.get("title") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const addedByName = formData.get("addedByName") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) throw new Error("No file provided");
  if (!file.type.startsWith("image/")) throw new Error("Only images allowed");
  if (file.size > 20 * 1024 * 1024) throw new Error("Image must be under 20 MB");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${projectId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const supabase = createServiceRoleClient();
  const { error: uploadError } = await supabase.storage
    .from("mood-board")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("mood_board_items").insert({
    project_id: projectId,
    organization_id: orgId ?? userId,
    room_id: roomId,
    type: "image",
    image_url: path,
    title,
    notes,
    added_by: userId,
    added_by_name: addedByName,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/mood-board`);
  revalidatePath(`/portal/${projectId}/mood-board`);
}

export async function addMoodBoardLink(data: {
  projectId: string;
  roomId?: string;
  linkUrl: string;
  title?: string;
  notes?: string;
  addedByName: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!data.linkUrl.startsWith("http")) throw new Error("Please enter a valid URL");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("mood_board_items").insert({
    project_id: data.projectId,
    organization_id: orgId ?? userId,
    room_id: data.roomId || null,
    type: "link",
    link_url: data.linkUrl,
    title: data.title || null,
    notes: data.notes || null,
    added_by: userId,
    added_by_name: data.addedByName,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${data.projectId}/mood-board`);
  revalidatePath(`/portal/${data.projectId}/mood-board`);
}

export async function deleteMoodBoardItem(itemId: string, projectId: string, imagePath?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  if (imagePath) {
    await supabase.storage.from("mood-board").remove([imagePath]);
  }

  const { error } = await supabase.from("mood_board_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/mood-board`);
  revalidatePath(`/portal/${projectId}/mood-board`);
}
