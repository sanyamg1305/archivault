"use server";

import { auth } from "@clerk/nextjs/server";
import { assertAdmin } from "@/lib/project-access";
import { createServiceRoleClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";

export async function requestSignoff(projectId: string, notes: string, requestedByName: string) {
  const { userId, orgId } = await assertAdmin();

  const supabase = createServiceRoleClient();

  // Upsert — one sign-off per project
  const { error } = await supabase.from("project_signoffs").upsert(
    {
      project_id: projectId,
      organization_id: orgId,
      status: "pending",
      notes,
      requested_by: userId,
      requested_by_name: requestedByName,
      requested_at: new Date().toISOString(),
      signed_by_user_id: null,
      signed_by_name: null,
      signed_at: null,
    },
    { onConflict: "project_id" }
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/signoff`);
  revalidatePath(`/portal/${projectId}/signoff`);
}

export async function submitSignoff(projectId: string, signedByName: string) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  if (orgRole !== "org:member") throw new Error("Unauthorized");

  // Verify this client is the one assigned to the project
  const supabase = createServiceRoleClient();
  const { data: project } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();
  if (project?.client_id !== userId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("project_signoffs")
    .update({
      status: "signed",
      signed_by_user_id: userId,
      signed_by_name: signedByName,
      signed_at: new Date().toISOString(),
    })
    .eq("project_id", projectId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/signoff`);
  revalidatePath(`/portal/${projectId}/signoff`);
}

export async function getSignoff(projectId: string) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("project_signoffs")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();
  return data;
}
