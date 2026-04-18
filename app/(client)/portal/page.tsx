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

  const { userId } = await auth();

  // Find the projects associated with this client
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, client_reference")
    .eq("organization_id", orgId)
    .eq("client_id", userId as string);

  if (projects && projects.length === 1) {
    redirect(`/portal/${projects[0].id}/dashboard`);
  }

  if (projects && projects.length > 1) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/50 p-6">
        <div className="max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold">Select Your Project</h1>
          <div className="grid gap-4">
            {projects.map((proj) => (
              <a
                key={proj.id}
                href={`/portal/${proj.id}/dashboard`}
                className="block p-4 border bg-background rounded-lg hover:border-primary transition-colors"
              >
                <div className="font-semibold">{proj.name}</div>
                <div className="text-sm text-muted-foreground">{proj.client_reference}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no project is found or not assigned yet.
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold">No Active Project Found</h1>
        <p className="text-muted-foreground mt-2">
          It looks like you haven't been assigned to a specific project yet. Please contact your architect to get access to your dashboard.
        </p>
      </div>
    </div>
  );
}
