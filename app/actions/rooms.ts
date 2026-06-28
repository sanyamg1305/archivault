"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRoom(projectId: string, data: {
  name: string;
  room_type?: string;
  floor_area_sqft?: number | null;
  ceiling_height_ft?: number | null;
  notes?: string;
  floor_id?: string | null;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name: data.name,
      project_id: projectId,
      room_type: data.room_type || null,
      floor_area_sqft: data.floor_area_sqft || null,
      ceiling_height_ft: data.ceiling_height_ft || null,
      notes: data.notes || null,
      floor_id: data.floor_id || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Created room: ${data.name}`,
  });

  revalidatePath(`/projects/${projectId}/rooms`);
  return room;
}

export async function updateRoom(projectId: string, roomId: string, data: {
  name: string;
  room_type?: string;
  floor_area_sqft?: number | null;
  ceiling_height_ft?: number | null;
  notes?: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("rooms")
    .update({
      name: data.name,
      room_type: data.room_type || null,
      floor_area_sqft: data.floor_area_sqft || null,
      ceiling_height_ft: data.ceiling_height_ft || null,
      notes: data.notes || null,
    })
    .eq("id", roomId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/rooms`);
}

export async function deleteRoom(projectId: string, roomId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/rooms`);
}
