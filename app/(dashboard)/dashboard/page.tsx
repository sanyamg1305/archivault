import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequiresAttention } from "@/components/dashboard/requires-attention";

export const metadata = {
  title: "Dashboard — Action Center",
  description: "Action center for your architecture and design projects.",
};

export default async function DashboardPage() {
  const { orgId, userId } = await auth();

  const supabase = createServiceRoleClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "admin";

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", orgId ?? "")
    .order("created_at", { ascending: false });

  const projectIds = projects?.map(p => p.id) ?? [];

  const [{ data: allMaterials }, { data: allMilestones }] = await Promise.all([
    supabase
      .from("materials")
      .select("project_id, estimated_cost, status")
      .in("project_id", projectIds.length ? projectIds : ["_none_"]),
    supabase
      .from("project_milestones")
      .select("project_id, completed_at")
      .in("project_id", projectIds.length ? projectIds : ["_none_"]),
  ]);

  // Group milestones by project for O(1) lookup
  const milestonesByProject = new Map<string, { total: number; completed: number }>();
  for (const m of allMilestones ?? []) {
    const cur = milestonesByProject.get(m.project_id) ?? { total: 0, completed: 0 };
    cur.total++;
    if (m.completed_at) cur.completed++;
    milestonesByProject.set(m.project_id, cur);
  }

  // Group materials by project once (O(n)) then compute budget per project (O(n+m) total)
  const materialsByProject = new Map<string, typeof allMaterials>();
  for (const m of allMaterials ?? []) {
    if (!materialsByProject.has(m.project_id)) materialsByProject.set(m.project_id, []);
    materialsByProject.get(m.project_id)!.push(m);
  }
  const budgetUtilization = projects?.reduce((acc, project) => {
    const spent = (materialsByProject.get(project.id) ?? [])
      .filter(m => m.status !== "Rejected")
      .reduce((sum, m) => sum + (Number(m.estimated_cost) || 0), 0);
    acc[project.id] = { spent, total: Number(project.total_budget) || 0 };
    return acc;
  }, {} as Record<string, { spent: number; total: number }>) || {};

  // Fetch Pending Materials (scoped to org projects)
  const { data: pendingMaterials } = await supabase
    .from("materials")
    .select(`
      id, 
      project_id, 
      room_id, 
      name, 
      status, 
      projects(name)
    `)
    .in("project_id", projectIds.length ? projectIds : ["_none_"])
    .in("status", ["Pending", "Revision Requested"])
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch Pending Designs (scoped to org projects via designs join)
  const { data: pendingDesigns } = await supabase
    .from("design_versions")
    .select(`
      id, 
      status, 
      version_number, 
      designs!inner(project_id, title, room_id, projects(name))
    `)
    .in("designs.project_id", projectIds.length ? projectIds : ["_none_"])
    .in("status", ["Pending", "Revision Requested"])
    .order("created_at", { ascending: false })
    .limit(10);

  // Normalize pending items into a unified list
  const actionItems = [
    ...(pendingMaterials || []).map((m: any) => ({
      id: m.id,
      type: 'material' as const,
      title: m.name,
      status: m.status,
      projectId: m.project_id,
      projectName: m.projects?.name || "Unknown Project",
    })),
    ...(pendingDesigns || []).map((d: any) => ({
      id: d.id,
      type: 'design' as const,
      title: `${d.designs?.title || "Design"} (v${d.version_number})`,
      status: d.status,
      projectId: d.designs?.project_id,
      projectName: d.designs?.projects?.name || "Unknown Project",
    }))
  ].sort((a, b) => {
    // Put "Revision Requested" items at the top
    if (a.status === 'Revision Requested' && b.status !== 'Revision Requested') return -1;
    if (b.status === 'Revision Requested' && a.status !== 'Revision Requested') return 1;
    return 0;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Action Center</h1>
          <p className="text-muted-foreground mt-1">
            Your daily overview. Here is what needs attention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <CreateProjectDialog />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Action Items */}
        <div className="lg:col-span-2 space-y-6">
          <RequiresAttention actionItems={actionItems} />

          {/* Ongoing Projects Section */}
          <div className="pt-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                Ongoing Projects
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/projects">View All Projects</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects && projects.length > 0 ? (
                projects.slice(0, 3).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                    <Card className="hover:border-primary/50 hover:shadow-sm transition-all h-full bg-card/50">
                      <CardHeader className="p-4 pb-3">
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription className="text-xs">{project.client_reference}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        {(() => {
                          const ms = milestonesByProject.get(project.id);
                          const pct = ms && ms.total > 0 ? Math.round((ms.completed / ms.total) * 100) : null;
                          return pct !== null ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span className="font-medium text-foreground">{pct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <p className="text-xs text-muted-foreground">{ms!.completed}/{ms!.total} milestones</p>
                            </div>
                          ) : null;
                        })()}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                            Open project <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  No projects yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Budget Health */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Budget Health</h2>

          <div className="space-y-4">
            {projects && projects.length > 0 ? (
              projects.map(project => {
                const { spent, total } = budgetUtilization[project.id];
                const percentage = total > 0 ? Math.min(Math.round((spent / total) * 100), 100) : 0;

                let statusColor = "bg-primary";
                let textColor = "text-primary";
                if (percentage >= 90) {
                  statusColor = "bg-destructive";
                  textColor = "text-destructive";
                } else if (percentage >= 75) {
                  statusColor = "bg-amber-500";
                  textColor = "text-amber-500";
                }

                return (
                  <Card key={project.id} className="border-muted hover:border-border transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium line-clamp-1">
                          <Link href={`/projects/${project.id}`} className="hover:underline">
                            {project.name}
                          </Link>
                        </CardTitle>
                        <span className={`text-xs font-bold ${textColor}`}>
                          {percentage}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${statusColor} rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span className="font-medium text-foreground/80">
                            ₹{spent.toLocaleString('en-IN')} spent
                          </span>
                          <span>
                            of ₹{total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-dashed bg-transparent shadow-none">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No active projects to monitor.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
