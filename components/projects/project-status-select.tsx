"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProjectStatus } from "@/app/actions/projects";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  "Active": "text-green-700 bg-green-100 border-green-200",
  "On Hold": "text-amber-700 bg-amber-100 border-amber-200",
  "Completed": "text-blue-700 bg-blue-100 border-blue-200",
};

export function ProjectStatusSelect({ projectId, status }: { projectId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        await updateProjectStatus(projectId, newStatus);
        toast.success(`Status updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    });
  };

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className={cn("h-7 w-32 text-xs font-semibold border rounded-full px-3", statusStyles[status] ?? "")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Active">Active</SelectItem>
        <SelectItem value="On Hold">On Hold</SelectItem>
        <SelectItem value="Completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  );
}
