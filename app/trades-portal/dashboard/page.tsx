import { redirect } from "next/navigation";
import { getMyTradeWorker, getMyTasks } from "@/app/actions/trades-portal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Circle, Clock, PauseCircle, HardHat, AlertCircle } from "lucide-react";
import { TaskStatusUpdater } from "@/components/trades/task-status-updater";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; icon: any; style: any }> = {
  Pending: {
    label: "Pending",
    icon: Circle,
    style: {
      border: "border-blue-200/60 dark:border-blue-500/20",
      bg: "bg-blue-50/50 dark:bg-blue-500/5",
      text: "text-blue-900 dark:text-blue-400",
      badge: "bg-[#eaefff] dark:bg-[#2F5BFF]/20 text-[#2F5BFF] dark:text-[#93c5fd]",
      leftBorder: "bg-[#2F5BFF]",
    }
  },
  "In Progress": {
    label: "In Progress",
    icon: Clock,
    style: {
      border: "border-purple-200/60 dark:border-purple-500/20",
      bg: "bg-purple-50/50 dark:bg-purple-500/5",
      text: "text-purple-900 dark:text-purple-400",
      badge: "bg-[#faf5ff] dark:bg-purple-500/20 text-[#6b21a8] dark:text-purple-300",
      leftBorder: "bg-purple-500",
    }
  },
  "On Hold": {
    label: "On Hold",
    icon: PauseCircle,
    style: {
      border: "border-amber-200/60 dark:border-amber-500/20",
      bg: "bg-amber-50/50 dark:bg-amber-500/5",
      text: "text-amber-900 dark:text-amber-400",
      badge: "bg-[#fefce8] dark:bg-amber-500/20 text-[#a16207] dark:text-amber-300",
      leftBorder: "bg-amber-500",
    }
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    style: {
      border: "border-emerald-200/60 dark:border-emerald-500/20",
      bg: "bg-emerald-50/50 dark:bg-emerald-500/5",
      text: "text-emerald-900 dark:text-emerald-400",
      badge: "bg-[#ecfdf5] dark:bg-emerald-500/20 text-[#047857] dark:text-emerald-300",
      leftBorder: "bg-emerald-500",
    }
  },
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
    <div className="space-y-10 py-4 animate-in fade-in duration-300 relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-gradient-to-br from-[#2F5BFF]/5 to-[#6366f1]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[250px] h-[250px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Trades Header Card (Redesigned with glowing premium look) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f10] p-8 text-white shadow-xl min-h-[160px] flex flex-col justify-between">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-[#2F5BFF]/20 text-[#93c5fd] border border-[#2F5BFF]/30 flex items-center gap-1.5 w-fit">
            <HardHat className="w-3.5 h-3.5" />
            Trades Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-white">
            Welcome, {worker.name} 👋
          </h1>
          <p className="text-sm text-white/70 leading-relaxed font-medium">
            {worker.trade_type} · Coordinate project milestones, view room locations, and update statuses as tasks are completed.
          </p>
        </div>
        {/* Abstract background graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#2F5BFF]/10 to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#2F5BFF]/20 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-2xl text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No tasks assigned yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your studio architect will assign tasks to you here.
          </p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-8">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const list = grouped[status] ?? [];
            if (list.length === 0) return null;
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4 text-[#2F5BFF]" />
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {config.label}
                  </h2>
                  <Badge className="text-xs bg-muted/65 border font-bold text-foreground" variant="outline">{list.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {list.map((task) => {
                    const overdue =
                      task.due_date &&
                      task.status !== "Completed" &&
                      new Date(task.due_date) < new Date();
                    
                    const style = overdue 
                      ? {
                          border: "border-rose-200/80 dark:border-rose-500/30",
                          bg: "bg-rose-50/50 dark:bg-rose-500/5",
                          text: "text-rose-900 dark:text-rose-400",
                          badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300",
                          leftBorder: "bg-rose-500",
                        }
                      : config.style;

                    return (
                      <Card 
                        key={task.id} 
                        className={cn(
                          "border rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:shadow-md",
                          style.bg,
                          style.border
                        )}
                      >
                        {/* Left vertical color highlight */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", style.leftBorder)} />
                        
                        <CardContent className="p-5 pl-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", style.badge)}>
                                  {overdue ? "Overdue" : task.status}
                                </span>
                                {overdue && <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
                              </div>

                              <p className={cn("text-sm font-bold leading-snug", style.text, task.status === "Completed" && "line-through opacity-70")}>
                                {task.title}
                              </p>

                              <p className="text-xs font-semibold text-muted-foreground/80">
                                Project: <span className="text-foreground">{task.projects?.name}</span>
                                {task.rooms?.name ? (
                                  <> · Room: <span className="text-foreground">{task.rooms.name}</span></>
                                ) : ""}
                              </p>

                              {task.description && (
                                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {task.due_date && (
                                <p className={cn("text-[10px] font-semibold flex items-center gap-1.5", overdue ? "text-rose-600" : "text-muted-foreground")}>
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  Due {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  {overdue && " (Overdue)"}
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
