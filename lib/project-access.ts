import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

export type ProjectAccess = {
  userId: string;
  orgId: string;
  orgRole: string;
  isAdmin: boolean;
  canEdit: boolean;
};

/**
 * Returns access info for the current user on a specific project.
 * - org:admin  → full access (isAdmin=true, canEdit=true)
 * - org:architect → read all projects; edit only assigned ones
 * - anything else → null (should be redirected by middleware)
 */
export async function getProjectAccess(projectId: string): Promise<ProjectAccess | null> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) return null;

  if (orgRole === "org:admin") {
    return { userId, orgId, orgRole, isAdmin: true, canEdit: true };
  }

  if (orgRole === "org:architect") {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();
    return { userId, orgId, orgRole, isAdmin: false, canEdit: !!data };
  }

  return null;
}

/**
 * Server-action guard: throws if the user cannot edit this project.
 * Call at the top of every write server action that is project-scoped.
 */
export async function assertProjectAccess(projectId: string): Promise<{ userId: string; orgId: string; orgRole: string }> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  if (orgRole === "org:admin") return { userId, orgId, orgRole };

  if (orgRole === "org:architect") {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) throw new Error("You are not assigned to this project.");
    return { userId, orgId, orgRole };
  }

  throw new Error("Unauthorized");
}

/**
 * Server-action guard: throws if the user is not an org:admin.
 */
export async function assertAdmin(): Promise<{ userId: string; orgId: string }> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId || orgRole !== "org:admin") throw new Error("Unauthorized");
  return { userId, orgId };
}
