import { redirect } from "next/navigation";
import { getMyTradeWorker, getMyTasks } from "@/app/actions/trades-portal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Circle, Clock, PauseCircle } from "lucide-react";
import { TaskStatusUpdater } from "@/components/trades/task-status-updater";

const STATUS_CONFIG: Record<string, { label: string; icon: any }> = {
  Pending:       { label: "Pending",     icon: Circle },
  "In Progress": { label: "In Progress", icon: Clock },
  "On Hold":     { label: "On Hold",     icon: PauseCircle },
  Completed:     { label: "Completed",   icon: CheckCircle2 },
};

export default async function TradesPortalDashboard() {
  const worker = await getMyTradeWorker();
  if (!worker) redirect("/trades-portal/sign-in");

  const tasks = await getMyTasks(worker.id);

  const grouped: Record<string, typeof tasks> = {
    Pending: [], "In Progress": [], "On Hold": [], Completed: [],
  };
  for (const t of tasks) {
    (grouped[t.status] ?? grouped["Pending"]).push(t);
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

      {tasks.length > 0 && Object.entries(STATUS_CONFIG).map(([status, config]) => {
        const list = grouped[status] ?? [];
        if (list.length === 0) return null;
        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <config.icon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                {config.label}
              </h2>
              <Badge variant="secondary" className="text-xs">{list.length}</Badge>
            </div>
            <div className="space-y-3">
              {list.map((task) => {
                const overdue =
                  task.due_date &&
                  task.status !== "Completed" &&
                  new Date(task.due_date) < new Date();
                return (
                  <Card key={task.id} className={overdue ? "border-destructive/50" : ""}>
                    <CardContent className="p-4">
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
                            <p className={`text-xs font-medium flex items-center gap-1 ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                              <CalendarDays className="h-3 w-3" />
                              Due {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {overdue && " · Overdue"}
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
  );
}
