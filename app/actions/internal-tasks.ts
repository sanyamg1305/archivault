"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { assertProjectAccess } from "@/lib/project-access";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInternalTask(data: {
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName: string;
  dueDate?: string;
}) {
  const { userId, orgId } = await assertProjectAccess(data.projectId);
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("internal_tasks").insert({
    project_id: data.projectId,
    organization_id: orgId,
    title: data.title,
    description: data.description || null,
    assigned_to: data.assignedTo,
    assigned_to_name: data.assignedToName,
    due_date: data.dueDate || null,
    created_by: userId,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${data.projectId}/internal-tasks`);
}

export async function updateInternalTaskStatus(
  taskId: string,
  status: "Pending" | "In Progress" | "Completed" | "On Hold",
  projectId: string
) {
  await assertProjectAccess(projectId);
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("internal_tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/internal-tasks`);
}

export async function deleteInternalTask(taskId: string, projectId: string) {
  await assertProjectAccess(projectId);
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("internal_tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/internal-tasks`);
}

export async function getOrgMembers() {
  const { orgId } = await auth();
  if (!orgId) return [];
  const clerk = await clerkClient();
  const memberships = await clerk.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: 100,
  });
  return memberships.data.map(m => ({
    userId: m.publicUserData?.userId ?? "",
    name: `${m.publicUserData?.firstName ?? ""} ${m.publicUserData?.lastName ?? ""}`.trim() || m.publicUserData?.identifier || "Unknown Member",
  })).filter(m => m.userId !== "");
}
