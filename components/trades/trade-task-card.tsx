"use client";

import { useTransition } from "react";
import { CalendarDays, HardHat, Home, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateTradeTaskStatus, deleteTradeTask } from "@/app/actions/trades";

const STATUSES = ["Pending", "In Progress", "On Hold", "Completed"];

export function TradeTaskCard({ task, projectId }: { task: any; projectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      try {
        await updateTradeTaskStatus(task.id, projectId, status);
      } catch (err) {
        toast.error("Failed to update", { description: err instanceof Error ? err.message : "Try again." });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTradeTask(task.id, projectId);
        toast.success("Task removed");
      } catch (err) {
        toast.error("Failed", { description: err instanceof Error ? err.message : "Try again." });
      }
    });
  }

  const tradeName = task.trades ? `${task.trades.name} (${task.trades.trade_type})` : "Unassigned";
  const roomName = task.rooms?.name ?? "General";
  const isOverdue = task.due_date && task.status !== "Completed" && new Date(task.due_date) < new Date();

  return (
    <Card className="border-muted">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm leading-snug">{task.title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <HardHat className="h-3.5 w-3.5" />
            {tradeName}
          </span>
          <span className="flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            {roomName}
          </span>
          {task.due_date && (
            <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {isOverdue && " · Overdue"}
            </span>
          )}
        </div>

        <Select value={task.status} onValueChange={handleStatusChange} disabled={isPending}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
