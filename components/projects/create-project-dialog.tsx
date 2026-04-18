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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { createProject } from "@/app/actions/projects";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { memberships } = useOrganization({
    memberships: true,
  });
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const clientId = formData.get("client_id") as string | undefined;
    const selectedMember = memberships?.data?.find(m => m.publicUserData?.userId === clientId);
    const clientRef = selectedMember?.publicUserData
      ? `${selectedMember.publicUserData.firstName || ''} ${selectedMember.publicUserData.lastName || ''}`.trim() || selectedMember.publicUserData.identifier || "Unknown Client"
      : "Unknown Client";

    try {
      const project = await createProject({
        name: formData.get("name") as string,
        client_reference: clientRef,
        total_budget: Number(formData.get("total_budget")),
        client_id: clientId,
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
            <Label htmlFor="client_id">Assign Client (Optional)</Label>
            <Select name="client_id">
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {memberships?.data?.map((mem) => {
                  if (mem.role === "org:admin") return null; // Optionally filter out architects
                  
                  const userData = mem.publicUserData;
                  if (!userData) return null;

                  return (
                    <SelectItem key={userData.userId || mem.id} value={userData.userId || ""}>
                      {userData.firstName || userData.identifier}{" "}
                      {userData.lastName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
