"use client";

import React, { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Trash2, CalendarDays, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleMilestone, deleteMilestone } from "@/app/actions/milestones";
import { cn } from "@/lib/utils";

export function MilestoneItem({
  milestone,
  projectId,
  isLast,
}: {
  milestone: any;
  projectId: string;
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const done = !!milestone.completed_at;
  const isOverdue = !done && milestone.target_date && new Date(milestone.target_date) < new Date();

  // Dynamic styling based on milestone status (Done = Green, Overdue = Pink, Pending = Blue)
  const cardStyle = done
    ? {
        border: "border-emerald-200/60 dark:border-emerald-500/20",
        bg: "bg-emerald-50/50 dark:bg-emerald-500/5",
        text: "text-emerald-800 dark:text-emerald-400",
        badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300",
        leftBorder: "bg-emerald-500",
      }
    : isOverdue
    ? {
        border: "border-rose-200/60 dark:border-rose-500/20",
        bg: "bg-rose-50/50 dark:bg-rose-500/5",
        text: "text-rose-800 dark:text-rose-400",
        badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300",
        leftBorder: "bg-rose-500",
      }
    : {
        border: "border-blue-200/60 dark:border-blue-500/20",
        bg: "bg-blue-50/50 dark:bg-blue-500/5",
        text: "text-blue-800 dark:text-blue-400",
        badge: "bg-[#eaefff] dark:bg-[#2F5BFF]/20 text-[#2F5BFF] dark:text-[#93c5fd]",
        leftBorder: "bg-[#2F5BFF]",
      };

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleMilestone(milestone.id, projectId, !done);
        toast.success(done ? "Milestone marked active" : "Milestone completed!");
      } catch {
        toast.error("Failed to update milestone");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    startTransition(async () => {
      try {
        await deleteMilestone(milestone.id, projectId);
        toast.success("Milestone deleted successfully");
      } catch {
        toast.error("Failed to delete milestone");
      }
    });
  }

  return (
    <div className="relative pl-10 pb-6 group">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border/40" />
      )}

      {/* Completion toggle button (dot) */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 transition-all duration-300 shadow-sm",
          done
            ? "border-emerald-500 text-emerald-500 hover:bg-emerald-50/20"
            : isOverdue
            ? "border-rose-400 text-rose-400 hover:bg-rose-50/20"
            : "border-muted-foreground/40 text-muted-foreground hover:border-[#2F5BFF] hover:text-[#2F5BFF]"
        )}
      >
        {done ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 shrink-0" />
        )}
      </button>

      {/* Main card */}
      <div
        className={cn(
          "border rounded-2xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
          cardStyle.bg,
          cardStyle.border
        )}
      >
        {/* Left vertical color accent bar (matching intelly sidebar highlight styling) */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", cardStyle.leftBorder)} />

        <div className="flex items-start justify-between gap-4 pl-1">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", cardStyle.badge)}>
                {done ? "Completed" : isOverdue ? "Overdue" : "Pending"}
              </span>
              {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
            </div>

            <p className={cn("text-sm font-bold leading-snug", cardStyle.text, done && "line-through opacity-70")}>
              {milestone.title}
            </p>

            {milestone.description && (
              <p className="text-xs text-muted-foreground/90 max-w-2xl leading-relaxed">
                {milestone.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] text-muted-foreground font-semibold">
              {milestone.target_date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/60" />
                  Target: {new Date(milestone.target_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              {milestone.completed_at && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  Completed: {new Date(milestone.completed_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-opacity"
            onClick={handleDelete}
            disabled={isPending}
            title="Delete milestone"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
