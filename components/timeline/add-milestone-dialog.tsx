"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMilestone } from "@/app/actions/milestones";

const PRESETS = ["Design", "Permit / Approvals", "Procurement", "Execution", "Finishing", "Handover"];

export function AddMilestoneDialog({ projectId, nextOrder }: { projectId: string; nextOrder: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createMilestone(projectId, {
          title: fd.get("title") as string,
          description: fd.get("description") as string,
          target_date: fd.get("target_date") as string || undefined,
          sort_order: nextOrder,
        });
        toast.success("Milestone added");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Milestone</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add Milestone</DialogTitle>
          <DialogDescription>Add a phase or checkpoint to the project timeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label>Quick pick</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p} type="button"
                  className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted transition-colors"
                  onClick={() => {
                    const input = document.getElementById("ms-title") as HTMLInputElement;
                    if (input) input.value = p;
                  }}
                >{p}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ms-title">Title <span className="text-destructive">*</span></Label>
            <Input id="ms-title" name="title" required placeholder="e.g. Design Phase" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ms-desc">Description</Label>
            <Textarea id="ms-desc" name="description" rows={2} placeholder="Optional details…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ms-date">Target Date</Label>
            <Input id="ms-date" name="target_date" type="date" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding…" : "Add Milestone"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
