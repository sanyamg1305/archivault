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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { assignClientToProject } from "@/app/actions/projects";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AssignClientDialog({ projectId, currentClientName }: { projectId: string, currentClientName?: string | null }) {
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
    const clientId = formData.get("client_id") as string;
    
    if (!clientId) {
      toast.error("Please select a client.");
      setLoading(false);
      return;
    }

    const selectedMember = memberships?.data?.find(m => m.publicUserData?.userId === clientId);
    const clientRef = selectedMember?.publicUserData
      ? `${selectedMember.publicUserData.firstName || ''} ${selectedMember.publicUserData.lastName || ''}`.trim() || selectedMember.publicUserData.identifier || "Unknown Client"
      : "Unknown Client";

    try {
      await assignClientToProject(projectId, clientId, clientRef);
      setOpen(false);
      toast.success("Client Assigned", {
        description: `Successfully assigned ${clientRef} to the project.`,
      });
      router.refresh();
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
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {currentClientName && (
            <div className="text-sm text-muted-foreground pb-2">
              Current Client: <span className="font-medium text-foreground">{currentClientName}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="client_id">Select Client</Label>
            <Select name="client_id">
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {memberships?.data?.map((mem) => {
                  if (mem.role === "org:admin") return null; 
                  
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
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Save Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
