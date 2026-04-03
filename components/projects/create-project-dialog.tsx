"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { createProject } from "@/app/actions/projects";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    try {
      const project = await createProject({
        name: formData.get("name") as string,
        client_reference: formData.get("client_reference") as string,
        total_budget: Number(formData.get("total_budget")),
      });

      setOpen(false);
      toast.success("Project Created", {
        description: `${project.name} is ready.`,
      });
      router.push(`/projects/${project.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error("Error", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <PlusCircle className="h-3.5 w-3.5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to start a new project and set the total budget.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Riverside Villa"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_reference">Client Name / Reference</Label>
            <Input
              id="client_reference"
              name="client_reference"
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="total_budget">Total Project Budget ($)</Label>
            <Input
              id="total_budget"
              name="total_budget"
              type="number"
              step="0.01"
              min="0"
              placeholder="50000"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
