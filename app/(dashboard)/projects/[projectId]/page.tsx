import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, CheckCircle, UserCircle, Home, Clock, FileText, CalendarDays } from "lucide-react";
import { EditBudgetDialog } from "@/components/projects/edit-budget-dialog";
import { AssignClientDialog } from "@/components/projects/assign-client-dialog";
import { ProjectNotes } from "@/components/projects/project-notes";
import { ProjectTimeline } from "@/components/projects/project-timeline";

export default async function ProjectOverview({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClerkSupabaseClient();

  const [
    { data: project },
    { data: approvedMaterials },
    { data: rooms },
    { data: activityLogs },
  ] = await Promise.all([
    supabase.from("projects").select("total_budget, client_reference, description, start_date, target_date, phase").eq("id", projectId).single(),
    supabase.from("materials").select("estimated_cost").eq("project_id", projectId).eq("status", "Approved"),
    supabase.from("rooms").select("id, name, materials(estimated_cost, status)").eq("project_id", projectId),
    supabase
      .from("activity_logs")
      .select("id, action_description, created_at, profiles(first_name, last_name, email)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const approvedSpend = approvedMaterials?.reduce((sum, m) => sum + Number(m.estimated_cost), 0) ?? 0;
  const remainingBudget = (project?.total_budget ?? 0) - approvedSpend;

  // Per-room spend
  const roomBreakdown = (rooms ?? []).map((room: any) => {
    const materials: any[] = Array.isArray(room.materials) ? room.materials : [];
    const approved = materials.filter((m) => m.status === "Approved").reduce((s: number, m: any) => s + Number(m.estimated_cost), 0);
    const total = materials.filter((m) => m.status !== "Rejected").reduce((s: number, m: any) => s + Number(m.estimated_cost), 0);
    return { id: room.id, name: room.name, approved, total, count: materials.length };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Financial health and project assignments.</p>
        </div>
        <AssignClientDialog projectId={projectId} currentClientName={project?.client_reference} />
      </div>

      {/* Top metric cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Total Budget
              <EditBudgetDialog projectId={projectId} currentBudget={project?.total_budget ?? 0} />
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(project?.total_budget ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Client</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate mt-1">
              {project?.client_reference || "Unassigned"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Spend</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${approvedSpend.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${remainingBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Per-room budget breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              Budget by Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roomBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No rooms created yet.</p>
            ) : (
              <div className="space-y-3">
                {roomBreakdown.map((room) => {
                  const pct = room.total > 0 ? Math.min(Math.round((room.approved / room.total) * 100), 100) : 0;
                  return (
                    <div key={room.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{room.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ${room.approved.toLocaleString()} / ${room.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activityLogs || activityLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No activity yet.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {activityLogs.map((log: any) => {
                  const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                  const who = profile
                    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.email
                    : "Unknown";
                  const when = new Date(log.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  });
                  return (
                    <div key={log.id} className="flex gap-3 text-sm">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="leading-snug">{log.action_description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{who} · {when}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline + Notes row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Timeline & Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectTimeline
              projectId={projectId}
              phase={project?.phase ?? "Design"}
              startDate={project?.start_date}
              targetDate={project?.target_date}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Project Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectNotes projectId={projectId} initialNotes={project?.description} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
