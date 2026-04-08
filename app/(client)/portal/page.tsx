import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OrganizationGuard } from "@/components/auth/org-guard";

export default async function ClientPortalIndex() {
  const { orgId } = await auth();

  if (!orgId) {
    return <OrganizationGuard />;
  }

  const supabase = await createClerkSupabaseClient();

  // Find the project associated with this organization
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("organization_id", orgId)
    .single();

  if (project?.id) {
    redirect(`/portal/${project.id}/dashboard`);
  }

  // If no project is found, maybe they haven't been assigned yet.
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">No Project Found</h1>
        <p className="text-muted-foreground mt-2">
          Your organization does not have an active project assigned yet.
        </p>
      </div>
    </div>
  );
}
