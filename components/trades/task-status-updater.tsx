"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateMyTaskStatus } from "@/app/actions/trades-portal";

const STATUSES = ["Pending", "In Progress", "On Hold", "Completed"];

export function TaskStatusUpdater({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      try {
        await updateMyTaskStatus(taskId, value);
        toast.success(`Marked as ${value}`);
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[130px] h-8 text-xs shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map(s => (
          <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
