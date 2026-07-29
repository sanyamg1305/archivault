"use client";

import React, { useState } from "react";
import { updateInternalTaskStatus, deleteInternalTask } from "@/app/actions/internal-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Trash2, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InternalTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_to_name: string;
  status: "Pending" | "In Progress" | "Completed" | "On Hold";
  due_date: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Pending: { label: "Pending", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400 border-zinc-200/50" },
  "In Progress": { label: "In Progress", color: "bg-blue-50 text-[#2F5BFF] dark:bg-[#2F5BFF]/10 border-[#2F5BFF]/20" },
  Completed: { label: "Completed", color: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200/20" },
  "On Hold": { label: "On Hold", color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200/20" },
};

export function InternalTaskCard({
  task,
  projectId,
}: {
  task: InternalTask;
  projectId: string;
}) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(status: any) {
    setUpdating(true);
    try {
      await updateInternalTaskStatus(task.id, status, projectId);
      toast.success("Task status updated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setDeleting(true);
    try {
      await deleteInternalTask(task.id, projectId);
      toast.success("Task deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="border border-border/60 hover:border-[#2F5BFF]/50 rounded-xl p-5 bg-card/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between h-full gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
            {task.title}
          </h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[task.status]?.color || "bg-zinc-100"}`}>
            {STATUS_CONFIG[task.status]?.label || task.status}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-border/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Assignment Info */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <User className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <span className="truncate max-w-[120px] font-medium" title={task.assigned_to_name}>
              {task.assigned_to_name}
            </span>
          </div>

          {/* Due Date Info */}
          {task.due_date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <span>
                {new Date(task.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2.5 pt-1">
          {/* Status Select dropdown */}
          <div className="w-[120px]">
            <Select
              value={task.status}
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger className="h-8 text-xs bg-transparent">
                {updating ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5 shrink-0" />
                ) : null}
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delete Action button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete task"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
