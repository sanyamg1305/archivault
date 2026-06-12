import { linkAndGetTradeWorker, getMyTasks } from "@/app/actions/trades-portal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CalendarDays, CheckCircle2, Circle, Clock, PauseCircle } from "lucide-react";
import { TaskStatusUpdater } from "@/components/trades/task-status-updater";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  Pending:      { label: "Pending",     icon: Circle,       color: "bg-zinc-100 text-zinc-600" },
  "In Progress":{ label: "In Progress", icon: Clock,        color: "bg-blue-100 text-blue-700" },
  "On Hold":    { label: "On Hold",     icon: PauseCircle,  color: "bg-yellow-100 text-yellow-700" },
  Completed:    { label: "Completed",   icon: CheckCircle2, color: "bg-green-100 text-green-700" },
};

export default async function TradesPortalDashboard() {
  const { worker, error } = await linkAndGetTradeWorker();

  if (error || !worker) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Account not linked</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error ?? "Your account could not be linked. Please contact your architect."}
        </p>
      </div>
    );
  }

  const tasks = await getMyTasks(worker.id);

  const grouped: Record<string, typeof tasks> = {
    Pending: [],
    "In Progress": [],
    "On Hold": [],
    Completed: [],
  };
  for (const t of tasks) {
    if (grouped[t.status]) grouped[t.status].push(t);
    else grouped["Pending"].push(t);
  }

  const active = tasks.filter(t => t.status !== "Completed").length;
  const done = tasks.filter(t => t.status === "Completed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {worker.name}</h1>
        <p className="text-muted-foreground mt-1">
          {worker.trade_type} &mdash; {active} active task{active !== 1 ? "s" : ""}, {done} completed
        </p>
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No tasks assigned yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your architect will assign tasks to you here.
          </p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-8">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const statusTasks = grouped[status] ?? [];
            if (statusTasks.length === 0) return null;
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    {config.label}
                  </h2>
                  <Badge variant="secondary" className="text-xs">{statusTasks.length}</Badge>
                </div>
                <div className="space-y-3">
                  {statusTasks.map((task) => {
                    const isOverdue =
                      task.due_date &&
                      task.status !== "Completed" &&
                      new Date(task.due_date) < new Date();
                    return (
                      <Card key={task.id} className={isOverdue ? "border-destructive/50" : ""}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {task.projects?.name}
                                {task.rooms?.name ? ` · ${task.rooms.name}` : ""}
                              </p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              )}
                              {task.due_date && (
                                <p className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                                  <CalendarDays className="h-3 w-3" />
                                  Due {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  {isOverdue && " · Overdue"}
                                </p>
                              )}
                            </div>
                            <TaskStatusUpdater taskId={task.id} currentStatus={task.status} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
