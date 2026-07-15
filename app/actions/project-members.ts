"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { assertAdmin } from "@/lib/project-access";
import { revalidatePath } from "next/cache";

export async function getProjectMembers(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) return [];
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("project_members")
    .select("user_id, assigned_at")
    .eq("project_id", projectId)
    .eq("organization_id", orgId);
  return data ?? [];
}

export async function assignArchitectToProject(projectId: string, userId: string) {
  const { orgId } = await assertAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("project_members").upsert(
    { project_id: projectId, user_id: userId, organization_id: orgId },
    { onConflict: "project_id,user_id" }
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}

export async function unassignArchitectFromProject(projectId: string, userId: string) {
  await assertAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}

/** Returns all org:architect members in this org with their assignment status for a project. */
export async function getArchitectsWithAssignment(projectId: string) {
  const { orgId } = await assertAdmin();

  const clerk = await clerkClient();
  const { data: memberships } = await clerk.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: 100,
  });

  console.log("All memberships:", memberships.map(m => ({ email: m.publicUserData?.identifier, role: m.role })));
  const architects = memberships
    .filter((m) => m.role === "org:architect")
    .map((m) => ({
      userId: m.publicUserData?.userId ?? "",
      firstName: m.publicUserData?.firstName ?? "",
      lastName: m.publicUserData?.lastName ?? "",
      email: m.publicUserData?.identifier ?? "",
      imageUrl: m.publicUserData?.imageUrl,
    }));

  const supabase = createServiceRoleClient();
  const { data: assigned } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId)
    .eq("organization_id", orgId);

  const assignedSet = new Set((assigned ?? []).map((r) => r.user_id));

  return architects.map((a) => ({ ...a, assigned: assignedSet.has(a.userId) }));
}
