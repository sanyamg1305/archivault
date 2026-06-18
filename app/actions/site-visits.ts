"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSiteVisit(data: {
  projectId: string;
  title: string;
  visitDate: string;
  observations?: string;
  attendees?: string[];
  createdByName: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { data: visit, error } = await supabase
    .from("site_visits")
    .insert({
      project_id: data.projectId,
      organization_id: orgId,
      visit_date: data.visitDate,
      title: data.title,
      observations: data.observations || null,
      attendees: data.attendees ?? [],
      created_by: userId,
      created_by_name: data.createdByName,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("activity_logs").insert({
    project_id: data.projectId,
    user_id: userId,
    action_description: `Logged site visit: ${data.title}`,
  });

  revalidatePath(`/projects/${data.projectId}/site-visits`);
  revalidatePath(`/portal/${data.projectId}/dashboard`);
  return visit;
}

export async function deleteSiteVisit(visitId: string, projectId: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  await supabase.from("site_visits").delete().eq("id", visitId).eq("organization_id", orgId);
  revalidatePath(`/projects/${projectId}/site-visits`);
  revalidatePath(`/portal/${projectId}/dashboard`);
}

export async function updateSiteVisit(visitId: string, projectId: string, data: {
  title: string;
  visitDate: string;
  observations?: string;
  attendees?: string[];
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("site_visits")
    .update({
      title: data.title,
      visit_date: data.visitDate,
      observations: data.observations || null,
      attendees: data.attendees ?? [],
    })
    .eq("id", visitId)
    .eq("organization_id", orgId);

  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/site-visits`);
}
