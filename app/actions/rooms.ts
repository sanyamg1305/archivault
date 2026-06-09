"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRoom(projectId: string, name: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      name,
      project_id: projectId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Log activity
  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Created room: ${name}`,
  });

  revalidatePath(`/projects/${projectId}/rooms`);
  return data;
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
