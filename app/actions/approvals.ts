"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

type EntityType = "material" | "design_version";

async function assertApprovalAccess(projectId: string) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  if (orgRole === "org:architect") throw new Error("Unauthorized");
  if (orgRole === "org:member") {
    // Clients can only approve/reject their own project
    const supabase = createServiceRoleClient();
    const { data: project } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", projectId)
      .single();
    if (project?.client_id !== userId) throw new Error("Unauthorized");
  }
  return { userId, orgId, orgRole };
}

export async function approveItem(
  entityType: EntityType,
  id: string,
  projectId: string,
  itemName: string
) {
  const { userId, orgId } = await assertApprovalAccess(projectId);

  const supabase = createServiceRoleClient();
  const table = entityType === "material" ? "materials" : "design_versions";

  const { error } = await supabase
    .from(table)
    .update({ status: "Approved", revision_note: null })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const actionPrefix = entityType === "material" ? "Client approved material" : "Client approved design";
  
  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `${actionPrefix}: ${itemName}`,
  });

  await createNotification(orgId, {
    title: `Client approved: ${itemName}`,
    body: entityType === "material" ? "Material approved" : "Design approved",
    link: `/projects/${projectId}/${entityType === "material" ? "materials" : "designs"}`,
  });

  revalidatePath(`/portal/${projectId}`, "layout");
  revalidatePath(`/projects/${projectId}`, "layout");
  revalidatePath("/dashboard");
}

export async function requestRevisionItem(
  entityType: EntityType,
  id: string,
  projectId: string,
  itemName: string,
  reason: string
) {
  const { userId, orgId } = await assertApprovalAccess(projectId);

  const supabase = createServiceRoleClient();
  const table = entityType === "material" ? "materials" : "design_versions";

  const { error } = await supabase
    .from(table)
    .update({ status: "Revision Requested", revision_note: reason })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const actionPrefix = entityType === "material" ? "Client requested revision on material" : "Client requested revision on design";

  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `${actionPrefix}: ${itemName}`,
    metadata: { revision_reason: reason },
  });

  await createNotification(orgId, {
    title: `Revision requested: ${itemName}`,
    body: reason,
    link: `/projects/${projectId}/${entityType === "material" ? "materials" : "designs"}`,
  });

  revalidatePath(`/portal/${projectId}`, "layout");
  revalidatePath(`/projects/${projectId}`, "layout");
  revalidatePath("/dashboard");
}
