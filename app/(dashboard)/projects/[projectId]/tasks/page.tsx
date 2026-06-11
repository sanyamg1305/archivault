import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { CheckCircle2, Circle, Clock, PauseCircle, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddTradeTaskDialog } from "@/components/trades/add-trade-task-dialog";
import { TradeTaskCard } from "@/components/trades/trade-task-card";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  Pending:     { label: "Pending",     icon: Circle,        color: "bg-zinc-100 text-zinc-600" },
  "In Progress":{ label: "In Progress", icon: Clock,         color: "bg-blue-100 text-blue-700" },
  Completed:   { label: "Completed",   icon: CheckCircle2,  color: "bg-green-100 text-green-700" },
  "On Hold":   { label: "On Hold",     icon: PauseCircle,   color: "bg-yellow-100 text-yellow-700" },
};

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { orgId } = await auth();
  if (!orgId) return null;

  const supabase = createServiceRoleClient();

  const [{ data: tasks }, { data: trades }, { data: rooms }] = await Promise.all([
    supabase
      .from("trade_tasks")
      .select("*, trades(id, name, trade_type), rooms(id, name)")
      .eq("project_id", projectId)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("trades")
      .select("id, name, trade_type")
      .eq("organization_id", orgId)
      .order("name"),
    supabase
      .from("rooms")
      .select("id, name")
      .eq("project_id", projectId),
  ]);

  const grouped: Record<string, any[]> = { Pending: [], "In Progress": [], "On Hold": [], Completed: [] };
  for (const task of tasks ?? []) {
    if (grouped[task.status]) grouped[task.status].push(task);
    else grouped["Pending"].push(task);
  }

  const total = tasks?.length ?? 0;
  const done = tasks?.filter((t: any) => t.status === "Completed").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Trade Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {done}/{total} tasks completed
          </p>
        </div>
        <AddTradeTaskDialog projectId={projectId} trades={trades ?? []} rooms={rooms ?? []} />
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Assign work to your painters, plumbers and other trades.
          </p>
        </div>
      )}

      {total > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const statusTasks = grouped[status] ?? [];
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    {config.label}
                  </h3>
                  <Badge variant="secondary" className="text-xs">{statusTasks.length}</Badge>
                </div>
                {statusTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground border border-dashed rounded-lg p-3 text-center">None</p>
                ) : (
                  <div className="space-y-2">
                    {statusTasks.map((task: any) => (
                      <TradeTaskCard key={task.id} task={task} projectId={projectId} />
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
