import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/projects/project-nav";
import { ProjectStatusSelect } from "@/components/projects/project-status-select";

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

  const supabase = createServiceRoleClient();

  // Fetch project details and verify it belongs to this Org
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("organization_id", orgId ?? "")
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
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">{project.client_reference}</p>
              <ProjectStatusSelect projectId={projectId} status={project.status ?? "Active"} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-mono font-bold">
              ₹{project.total_budget.toLocaleString('en-IN')}
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
