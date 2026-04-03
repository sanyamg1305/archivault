import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata = {
  title: "Projects — ArchiVault",
  description: "Manage your architecture and design projects.",
};

export default async function DashboardPage() {
  const { orgId, userId } = await auth();

  if (!orgId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Please select an organization to continue.
        </p>
      </div>
    );
  }

  const supabase = await createClerkSupabaseClient();

  // 1. Fetch user profile for role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  // 2. Fetch projects — RLS ensures only this org's projects are returned
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const isAdmin = profile?.role === "admin";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your architecture and design projects.
          </p>
        </div>
        {isAdmin && <CreateProjectDialog />}
      </div>

      {/* Project Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:ring-primary/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.client_reference}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-medium">
                    Budget:{" "}
                    <span className="text-foreground">
                      ${project.total_budget.toLocaleString()}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
              No projects yet.{" "}
              {isAdmin
                ? "Create your first one to get started."
                : "Ask an admin to create a project."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
