"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClerkSupabaseClient, createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: {
  name: string;
  client_reference: string;
  total_budget: number;
  client_id?: string;
}) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = createServiceRoleClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: formData.name,
      client_reference: formData.client_reference,
      total_budget: formData.total_budget,
      organization_id: orgId,
      created_by: userId,
      ...(formData.client_id ? { client_id: formData.client_id } : {}),
    })
    .select()
    .single();

  if (projectError) {
    console.error("Supabase Error details:", projectError);
    throw new Error(projectError.message);
  }

  // 3. Create Activity Log
  await supabase.from("activity_logs").insert({
    project_id: project.id,
    user_id: userId,
    action_description: `Project created with a budget of ₹${formData.total_budget.toLocaleString('en-IN')}`,
  });

  revalidatePath("/dashboard");
  return project;
}

export async function updateProjectBudget(projectId: string, newBudget: number) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("projects")
    .update({ total_budget: newBudget })
    .eq("id", projectId)
    .eq("organization_id", orgId);

  if (error) {
    console.error("Supabase Error updating budget:", error);
    throw new Error(error.message);
  }

  // Create Activity Log
  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Updated project budget to ₹${newBudget.toLocaleString('en-IN')}`,
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function assignClientToProject(projectId: string, clientId: string, clientReference: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("projects")
    .update({ client_id: clientId, client_reference: clientReference })
    .eq("id", projectId)
    .eq("organization_id", orgId);

  if (error) {
    console.error("Supabase Error assigning client:", error);
    throw new Error(error.message);
  }

  // Create Activity Log
  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Assigned client ${clientReference} to project`,
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProjectStatus(projectId: string, status: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .eq("organization_id", orgId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`, "layout");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProjectNotes(projectId: string, description: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("projects").update({ description }).eq("id", projectId).eq("organization_id", orgId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectTimeline(projectId: string, data: {
  start_date: string | null;
  target_date: string | null;
  phase: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("projects").update(data).eq("id", projectId).eq("organization_id", orgId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function inviteClientToOrg(email: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const clerk = await clerkClient();
  await clerk.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role: "org:member",
    inviterUserId: userId,
  });

  return { success: true };
}
