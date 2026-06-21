"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
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

export async function deleteProject(projectId: string) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId || orgRole !== "org:admin") throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  // Delete all storage files: designs, documents, site photos, materials images
  const [{ data: designVersions }, { data: documents }, { data: sitePhotos }, { data: materials }] =
    await Promise.all([
      supabase
        .from("design_versions")
        .select("file_path, designs!inner(project_id)")
        .eq("designs.project_id", projectId),
      supabase.from("project_documents").select("file_path").eq("project_id", projectId),
      supabase.from("site_photos").select("storage_path").eq("project_id", projectId),
      supabase.from("materials").select("image_path").eq("project_id", projectId).not("image_path", "is", null),
    ]);

  await Promise.all([
    designVersions?.length
      ? supabase.storage.from("designs").remove(designVersions.map((v) => v.file_path))
      : Promise.resolve(),
    documents?.length
      ? supabase.storage.from("project-documents").remove(documents.map((d) => d.file_path))
      : Promise.resolve(),
    sitePhotos?.length
      ? supabase.storage.from("site-photos").remove(sitePhotos.map((p) => p.storage_path))
      : Promise.resolve(),
    materials?.length
      ? supabase.storage.from("materials").remove(materials.map((m) => m.image_path!))
      : Promise.resolve(),
  ]);

  // Delete the project — cascades to all child tables via FK
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("organization_id", orgId);
  if (error) throw new Error(error.message);

  revalidatePath("/projects");
  revalidatePath("/dashboard");
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
