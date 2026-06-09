import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, ChevronRight, FileImage, Layers, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard — Action Center",
  description: "Action center for your architecture and design projects.",
};

export default async function DashboardPage() {
  const { orgId, userId } = await auth();

  const supabase = await createClerkSupabaseClient();

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
    .order("created_at", { ascending: false });

  // Fetch all materials for budget calculation
  const { data: allMaterials } = await supabase
    .from("materials")
    .select("project_id, estimated_cost, status");

  // Calculate budget utilization per project
  const budgetUtilization = projects?.reduce((acc, project) => {
    const projectMaterials = allMaterials?.filter(m => m.project_id === project.id) || [];
    // Include all non-rejected materials in committed costs
    const spent = projectMaterials
      .filter(m => m.status !== 'Rejected')
      .reduce((sum, m) => sum + (Number(m.estimated_cost) || 0), 0);

    acc[project.id] = { spent, total: Number(project.total_budget) || 0 };
    return acc;
  }, {} as Record<string, { spent: number, total: number }>) || {};

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
    .in("status", ["Pending", "Revision Requested"])
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch Pending Designs (joining through designs -> projects)
  const { data: pendingDesigns } = await supabase
    .from("design_versions")
    .select(`
      id, 
      status, 
      version_number, 
      designs(project_id, title, room_id, projects(name))
    `)
    .in("status", ["Pending", "Revision Requested"])
    .order("created_at", { ascending: false })
    .limit(10);

  // Normalize pending items into a unified list
  const actionItems = [
    ...(pendingMaterials || []).map((m: any) => ({
      id: m.id,
      type: 'material',
      title: m.name,
      status: m.status,
      projectId: m.project_id,
      projectName: m.projects?.name || "Unknown Project",
      roomId: m.room_id,
      icon: <Layers className="w-4 h-4" />
    })),
    ...(pendingDesigns || []).map((d: any) => ({
      id: d.id,
      type: 'design',
      title: `${d.designs?.title || "Design"} (v${d.version_number})`,
      status: d.status,
      projectId: d.designs?.project_id,
      projectName: d.designs?.projects?.name || "Unknown Project",
      roomId: d.designs?.room_id,
      icon: <FileImage className="w-4 h-4" />
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Requires Attention
            </h2>
            <Badge variant="secondary" className="px-3 py-1 font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
              {actionItems.length} Pending
            </Badge>
          </div>

          <Card className="border-muted bg-card shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {actionItems.length > 0 ? (
                actionItems.map((item, index) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={`/projects/${item.projectId}/${item.type}s`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-md bg-secondary text-secondary-foreground mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {item.title}
                          {item.status === 'Revision Requested' && (
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm">
                              Revision
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <span className="font-medium text-foreground/70">{item.projectName}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="capitalize">{item.type}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1.5 opacity-70" />
                        {item.status === 'Revision Requested' ? 'Take action' : 'Waiting on Client'}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-200" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    There are no pending materials or design revisions requiring your attention right now.
                  </p>
                </div>
              )}
            </div>
          </Card>

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
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center justify-between mt-2">
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
