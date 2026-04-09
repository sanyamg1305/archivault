"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { updateProjectBudget } from "@/app/actions/projects";
import { toast } from "sonner";

export function EditBudgetDialog({
  projectId,
  currentBudget,
}: {
  projectId: string;
  currentBudget: number;
}) {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(currentBudget.toString());
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }

    setIsLoading(true);
    try {
      await updateProjectBudget(projectId, numBudget);
      toast.success("Budget updated successfully.");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update budget.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
