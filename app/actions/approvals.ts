"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type EntityType = "material" | "design_version";

export async function approveItem(
  entityType: EntityType,
  id: string,
  projectId: string,
  itemName: string
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = await createClerkSupabaseClient();
  const table = entityType === "material" ? "materials" : "design_versions";

  const { error } = await supabase
    .from(table)
    .update({ status: "Approved" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const actionPrefix = entityType === "material" ? "Client approved material" : "Client approved design";
  
  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `${actionPrefix}: ${itemName}`,
  });

  revalidatePath(`/portal/${projectId}`, "layout");
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function requestRevisionItem(
  entityType: EntityType,
  id: string,
  projectId: string,
  itemName: string,
  reason: string
) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = await createClerkSupabaseClient();
  const table = entityType === "material" ? "materials" : "design_versions";

  const { error } = await supabase
    .from(table)
    .update({ status: "Revision Requested" })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const actionPrefix = entityType === "material" ? "Client requested revision on material" : "Client requested revision on design";

  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `${actionPrefix}: ${itemName}`,
    metadata: { revision_reason: reason },
  });

  revalidatePath(`/portal/${projectId}`, "layout");
  revalidatePath(`/projects/${projectId}`, "layout");
}
