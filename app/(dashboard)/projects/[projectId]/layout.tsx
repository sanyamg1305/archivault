import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/projects/project-nav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  // In Next.js 15, params is a Promise — must be awaited
  const { projectId } = await params;
  const { orgId } = await auth();

  const supabase = await createClerkSupabaseClient();

  // Fetch project details and verify it belongs to this Org
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("organization_id", orgId)
    .single();

  if (!project) notFound();

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="border-b bg-card px-8 py-6 shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              Project
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground mt-0.5">{project.client_reference}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-mono font-bold">
              ${project.total_budget.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Project Navigation — client component for active state */}
        <ProjectNav projectId={projectId} />
      </div>

      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );
}
