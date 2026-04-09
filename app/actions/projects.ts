"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: {
  name: string;
  client_reference: string;
  total_budget: number;
}) {
  const { userId, orgId, orgRole } = await auth();

  console.log("--- DEBUG PROJECT CREATION ---");
  console.log("Clerk userId:", userId);
  console.log("Clerk orgId:", orgId);
  console.log("Clerk orgRole:", orgRole);

  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = await createClerkSupabaseClient();

  // Insert Project — RLS on Supabase side enforces org:admin check via auth.jwt() ->> 'org_role'
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name: formData.name,
      client_reference: formData.client_reference,
      total_budget: formData.total_budget,
      organization_id: orgId,
      created_by: userId,
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
    action_description: `Project created with a budget of $${formData.total_budget.toLocaleString()}`,
  });

  revalidatePath("/dashboard");
  return project;
}

export async function updateProjectBudget(projectId: string, newBudget: number) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) throw new Error("Missing User or Organization context.");

  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase
    .from("projects")
    .update({ total_budget: newBudget })
    .eq("id", projectId);

  if (error) {
    console.error("Supabase Error updating budget:", error);
    throw new Error(error.message);
  }

  // Create Activity Log
  await supabase.from("activity_logs").insert({
    project_id: projectId,
    user_id: userId,
    action_description: `Updated project budget to $${newBudget.toLocaleString()}`,
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
