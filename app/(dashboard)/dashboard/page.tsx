import { auth, currentUser } from "@clerk/nextjs/server";
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
import { ChevronRight, LayoutGrid, BarChart3, Calendar, ListTodo, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequiresAttention } from "@/components/dashboard/requires-attention";

export const metadata = {
  title: "Dashboard — Action Center",
  description: "Action center for your architecture and design projects.",
};

export default async function DashboardPage() {
  const { orgId, orgRole, userId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName || "Team Member";

  const supabase = createServiceRoleClient();

  const isAdmin = orgRole === "org:admin" || orgRole === "admin";
  const isArchitect = orgRole === "org:architect" || orgRole === "architect";

  // Fetch projects — architects only see their assigned projects
  let projectsQuery = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", orgId ?? "")
    .order("created_at", { ascending: false });

  if (isArchitect && userId) {
    const { data: assignments } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", userId)
      .eq("organization_id", orgId ?? "");
    const assignedIds = (assignments ?? []).map((a) => a.project_id);
    projectsQuery = projectsQuery.in("id", assignedIds.length ? assignedIds : ["_none_"]);
  }

  const { data: projects } = await projectsQuery;
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

  // Group materials by project
  const materialsByProject = new Map<string, typeof allMaterials>();
  for (const m of allMaterials ?? []) {
    if (!materialsByProject.has(m.project_id)) materialsByProject.set(m.project_id, []);
    materialsByProject.get(m.project_id)!.push(m);
  }
  const budgetUtilization: Record<string, { spent: number; total: number }> = projects?.reduce((acc, project) => {
    const spent = (materialsByProject.get(project.id) ?? [])
      .filter(m => m.status !== "Rejected")
      .reduce((sum, m) => sum + (Number(m.estimated_cost) || 0), 0);
    acc[project.id] = { spent, total: Number(project.total_budget) || 0 };
    return acc;
  }, {} as Record<string, { spent: number; total: number }>) || {};

  // Fetch Pending Materials
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

  // Fetch Pending Designs
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

  // Normalize pending items
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
    if (a.status === 'Revision Requested' && b.status !== 'Revision Requested') return -1;
    if (b.status === 'Revision Requested' && a.status !== 'Revision Requested') return 1;
    return 0;
  });

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-300">
      {/* Header (Eduplex Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Here is your studio's overview and items that need attention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <CreateProjectDialog />}
        </div>
      </div>

      {/* Ongoing Projects Section (Top Row like 'New Courses') */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#2F5BFF]" />
            Ongoing Projects
          </h2>
          <Button variant="ghost" size="sm" className="text-[#2F5BFF] hover:bg-[#eaefff] hover:text-[#2F5BFF] font-semibold" asChild>
            <Link href="/projects" className="flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.slice(0, isAdmin ? 3 : 6).map((project) => {
              const ms = milestonesByProject.get(project.id);
              const pct = ms && ms.total > 0 ? Math.round((ms.completed / ms.total) * 100) : 0;
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="block h-full group">
                  <div className="border border-border/60 hover:border-[#2F5BFF]/50 rounded-2xl p-6 bg-card/45 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between hover:-translate-y-1">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">
                          {project.phase || "Active"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-[#2F5BFF] transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {project.client_reference || "No Client Assigned"}
                      </p>
                    </div>
                    <div className="space-y-3 mt-6">
                      <div className="flex justify-between text-[10px] text-muted-foreground/80">
                        <span className="font-semibold">Milestones</span>
                        <span className="font-bold text-foreground">{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                        <div 
                          className="h-full bg-gradient-to-r from-[#2F5BFF] to-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/30 text-[11px] font-semibold text-muted-foreground group-hover:text-[#2F5BFF] transition-colors">
                        <span>Open project overview</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full border border-dashed border-border/60 rounded-2xl p-12 text-center text-sm text-muted-foreground bg-card/10">
              No active projects yet. Click "Create Project" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Section (Middle & Right Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3 Content Column */}
        <div className={`${isAdmin ? "lg:col-span-2" : "lg:col-span-3"} space-y-8`}>
          <RequiresAttention actionItems={actionItems} />

          {/* Performance/Studio Analytics Widget (Eduplex 'Hours Activity' style) */}
          <div className="border border-border/60 rounded-2xl p-6 bg-card/45 backdrop-blur-md shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#2F5BFF]" />
                Studio Performance
              </h3>
            </div>
            
            {/* Visual Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80">Active Projects</span>
                <p className="text-2xl font-bold text-foreground mt-2">{projects?.length ?? 0}</p>
              </div>
              <div className="bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80">Awaiting Action</span>
                <p className="text-2xl font-bold text-amber-600 mt-2">{actionItems.length}</p>
              </div>
              <div className="bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80">Approved Spend</span>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {allMaterials?.filter((m: any) => m.status === "Approved").length ?? 0}
                </p>
              </div>
              <div className="bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80">Milestones Done</span>
                <p className="text-2xl font-bold text-[#2F5BFF] mt-2">
                  {allMilestones?.filter((m: any) => m.completed_at).length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1/3 Widget Column (Only for Admin dashboard views) */}
        {isAdmin && (
          <div className="space-y-8">
            {/* Dark premium "Go Premium" style card for Budget utilization */}
            <div className="bg-[#0f0f10] border border-border/40 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="space-y-2 relative z-10">
                <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/10 text-white/90">
                  Global Metrics
                </span>
                <h3 className="text-lg font-bold mt-2">Budget Utilization</h3>
                <p className="text-xs text-white/70">
                  Monitor materials and approved expenses across all active client accounts.
                </p>
              </div>
              
              {(() => {
                const values = Object.values(budgetUtilization) as { spent: number; total: number }[];
                const totalSpent = values.reduce((sum, b) => sum + b.spent, 0);
                const totalBudget = values.reduce((sum, b) => sum + b.total, 0);
                const percentage = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
                return (
                  <div className="space-y-3 pt-4 relative z-10 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Total Approved</span>
                      <span className="font-bold">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2F5BFF] to-indigo-400 rounded-full" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>₹{totalSpent.toLocaleString('en-IN')}</span>
                      <span className="text-white/60">of ₹{totalBudget.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}
              {/* Decorative background grid/ring */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#2F5BFF]/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Project Schedule/Deadlines widget */}
            <div className="border border-border/60 rounded-2xl p-6 bg-card/45 backdrop-blur-md shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2F5BFF]" />
                Upcoming Target Dates
              </h3>
              <div className="space-y-3">
                {projects && projects.length > 0 ? (
                  projects.slice(0, 3).map((project) => {
                    const targetDate = project.target_date 
                      ? new Date(project.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "No target date";
                    return (
                      <div key={project.id} className="flex justify-between items-center text-xs p-3 rounded-xl bg-muted/10 border border-border/30">
                        <div>
                          <p className="font-semibold text-foreground truncate max-w-[120px]">{project.name}</p>
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5">{project.phase || "Design"}</p>
                        </div>
                        <span className="font-mono text-muted-foreground bg-muted/30 px-2.5 py-1 rounded text-[10px]">
                          {targetDate}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No deadlines pending.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
