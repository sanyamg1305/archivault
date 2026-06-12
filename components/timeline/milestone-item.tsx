"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleMilestone, deleteMilestone } from "@/app/actions/milestones";

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

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleMilestone(milestone.id, projectId, !done);
      } catch {
        toast.error("Failed to update milestone");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteMilestone(milestone.id, projectId);
      } catch {
        toast.error("Failed to delete milestone");
      }
    });
  }

  return (
    <div className="relative pl-10 pb-2 group">
      {/* dot */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 transition-colors hover:border-primary"
        style={{ borderColor: done ? "hsl(var(--primary))" : undefined }}
      >
        {done
          ? <CheckCircle2 className="h-4 w-4 text-primary" />
          : <Circle className="h-4 w-4 text-muted-foreground" />}
      </button>

      <div className={`rounded-lg border p-4 transition-colors ${done ? "bg-muted/30 border-muted" : "bg-card"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
              {milestone.title}
            </p>
            {milestone.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{milestone.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {milestone.target_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Target: {new Date(milestone.target_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              {milestone.completed_at && (
                <span className="text-primary font-medium">
                  Completed {new Date(milestone.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete} disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
