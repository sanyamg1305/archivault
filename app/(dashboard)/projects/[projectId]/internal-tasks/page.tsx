import { createServiceRoleClient } from "@/utils/supabase/server";
import { getProjectAccess } from "@/lib/project-access";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Clock, PauseCircle, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOrgMembers } from "@/app/actions/internal-tasks";
import { AddInternalTaskDialog } from "@/components/projects/add-internal-task-dialog";
import { InternalTaskCard } from "@/components/projects/internal-task-card";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  Pending: { label: "Pending", icon: Circle, color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400" },
  "In Progress": { label: "In Progress", icon: Clock, color: "bg-blue-50 text-[#2F5BFF] dark:bg-[#2F5BFF]/10 dark:text-[#2F5BFF]" },
  "On Hold": { label: "On Hold", icon: PauseCircle, color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400" },
  Completed: { label: "Completed", icon: CheckCircle2, color: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" },
};

export default async function ProjectInternalTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  if (!access) notFound(); // Clients or unauthorized users get 404

  const canEdit = access.canEdit;
  const orgId = access.orgId;

  const supabase = createServiceRoleClient();

  // Fetch tasks and organization members concurrently
  const [tasksRes, members] = await Promise.all([
    supabase
      .from("internal_tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    getOrgMembers(),
  ]);

  const tasks = tasksRes.data ?? [];

  const grouped: Record<string, any[]> = {
    Pending: [],
    "In Progress": [],
    "On Hold": [],
    Completed: [],
  };

  for (const task of tasks) {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    } else {
      grouped["Pending"].push(task);
    }
  }

  const total = tasks.length;
  const done = tasks.filter((t: any) => t.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Task Allotment</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {done}/{total} internal tasks completed · Visible only to your team.
          </p>
        </div>
        {canEdit && (
          <AddInternalTaskDialog projectId={projectId} members={members} />
        )}
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/80 rounded-xl text-center bg-card/40 backdrop-blur-md">
          <CalendarDays className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <p className="text-sm font-semibold text-foreground">No allotted tasks yet</p>
          <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm">
            Assign work, milestones, and details to your internal studio team members.
          </p>
        </div>
      )}

      {total > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const statusTasks = grouped[status] ?? [];
            return (
              <div key={status} className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4 text-muted-foreground/80" />
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {config.label}
                  </h3>
                  <Badge variant="secondary" className="text-xs bg-muted/40 font-semibold px-2 py-0.5">
                    {statusTasks.length}
                  </Badge>
                </div>

                {statusTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 border border-dashed border-border/40 rounded-xl p-4 text-center bg-card/10">
                    No tasks in this status
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1">
                    {statusTasks.map((task: any) => (
                      <InternalTaskCard
                        key={task.id}
                        task={task}
                        projectId={projectId}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
