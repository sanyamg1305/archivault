"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProjectTimeline } from "@/app/actions/projects";
import { toast } from "sonner";
import { CalendarDays, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = ["Design", "Procurement", "Execution", "Complete"];

const phaseColors: Record<string, string> = {
  Design: "bg-purple-100 text-purple-700",
  Procurement: "bg-blue-100 text-blue-700",
  Execution: "bg-amber-100 text-amber-700",
  Complete: "bg-green-100 text-green-700",
};

interface ProjectTimelineProps {
  projectId: string;
  phase: string;
  startDate?: string | null;
  targetDate?: string | null;
}

export function ProjectTimeline({ projectId, phase, startDate, targetDate }: ProjectTimelineProps) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({ phase, start_date: startDate ?? "", target_date: targetDate ?? "" });
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProjectTimeline(projectId, {
          phase: values.phase,
          start_date: values.start_date || null,
          target_date: values.target_date || null,
        });
        toast.success("Timeline updated");
        setEditing(false);
      } catch {
        toast.error("Failed to update timeline");
      }
    });
  };

  if (editing) {
    return (
      <div className="space-y-3 p-3 border rounded-md bg-secondary/20">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Phase</Label>
            <Select value={values.phase} onValueChange={(v) => setValues(prev => ({ ...prev, phase: v }))}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHASES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Start Date</Label>
            <Input
              type="date"
              className="h-8 text-sm"
              value={values.start_date}
              onChange={(e) => setValues(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Target Date</Label>
            <Input
              type="date"
              className="h-8 text-sm"
              value={values.target_date}
              onChange={(e) => setValues(prev => ({ ...prev, target_date: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={isPending}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Check className="h-4 w-4 mr-1" /> {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-4 p-3 rounded-md border border-transparent hover:border-border cursor-pointer transition-colors relative"
      onClick={() => setEditing(true)}
    >
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", phaseColors[phase] ?? "bg-secondary text-secondary-foreground")}>
        {phase}
      </span>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        {startDate ? (
          <span>{new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        ) : (
          <span className="italic">No start date</span>
        )}
        {(startDate || targetDate) && <span>→</span>}
        {targetDate ? (
          <span>{new Date(targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        ) : (
          startDate && <span className="italic">No target</span>
        )}
      </div>
      <Pencil className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
