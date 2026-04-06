"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMaterial(data: {
  projectId: string;
  roomId: string;
  name: string;
  category: string;
  brand: string;
  vendor: string;
  estimated_cost: number;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase.from("materials").insert({
    project_id: data.projectId,
    room_id: data.roomId,
    name: data.name,
    category: data.category,
    brand: data.brand,
    vendor: data.vendor,
    estimated_cost: data.estimated_cost,
    status: "Pending",
  });

  if (error) throw new Error(error.message);

  await supabase.from("activity_logs").insert({
    project_id: data.projectId,
    user_id: userId,
    action_description: `Added material: ${data.name} ($${data.estimated_cost})`,
  });

  revalidatePath(`/projects/${data.projectId}/materials`);
}

export async function updateMaterialStatus(
  projectId: string,
  materialId: string,
  name: string,
  status: string
) {
  const { userId } = await auth();
  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase
    .from("materials")
    .update({ status })
    .eq("id", materialId);

  if (error) throw new Error(error.message);

  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Material '${name}' status changed to ${status}`,
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/materials`);
}

export async function updateMaterial(
  materialId: string,
  projectId: string,
  data: {
    name: string;
    category: string;
    brand: string;
    vendor: string;
    estimated_cost: number;
    status: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase
    .from("materials")
    .update({
      name: data.name,
      category: data.category,
      brand: data.brand,
      vendor: data.vendor,
      estimated_cost: data.estimated_cost,
      status: data.status,
    })
    .eq("id", materialId);

  if (error) throw new Error(error.message);

  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Updated material: ${data.name} (New Cost: $${data.estimated_cost})`,
  });

  revalidatePath(`/projects/${projectId}/materials`);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteMaterial(materialId: string, projectId: string, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase.from("materials").delete().eq("id", materialId);

  if (error) throw new Error(error.message);

  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Deleted material: ${name}`,
  });

  revalidatePath(`/projects/${projectId}/materials`);
  revalidatePath(`/projects/${projectId}`);
}
