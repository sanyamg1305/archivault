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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { assignClientToProject, inviteClientToOrg } from "@/app/actions/projects";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AssignClientDialog({ projectId, currentClientName }: { projectId: string, currentClientName?: string | null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"assign" | "invite">("assign");
  const router = useRouter();

  const { memberships } = useOrganization({ memberships: true });

  async function handleAssign(event: React.FormEvent<HTMLFormElement>) {
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
      ? `${selectedMember.publicUserData.firstName || ""} ${selectedMember.publicUserData.lastName || ""}`.trim()
        || selectedMember.publicUserData.identifier
        || "Unknown Client"
      : "Unknown Client";

    try {
      await assignClientToProject(projectId, clientId, clientRef);
      setOpen(false);
      toast.success("Client assigned", { description: `${clientRef} assigned to the project.` });
      router.refresh();
    } catch (error: unknown) {
      toast.error("Error", { description: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    try {
      await inviteClientToOrg(email);
      setOpen(false);
      toast.success("Invitation sent", { description: `An invite was sent to ${email}. Assign them to the project once they join.` });
    } catch (error: unknown) {
      toast.error("Error", { description: error instanceof Error ? error.message : "Failed to send invite." });
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

        {/* Tab switcher */}
        <div className="flex border-b mt-1">
          {(["assign", "invite"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "assign" ? "Existing Member" : "Invite by Email"}
            </button>
          ))}
        </div>

        {tab === "assign" && (
          <form onSubmit={handleAssign} className="space-y-4 pt-2">
            {currentClientName && (
              <p className="text-sm text-muted-foreground">
                Current: <span className="font-medium text-foreground">{currentClientName}</span>
              </p>
            )}
            <div className="space-y-2">
              <Label>Select Client</Label>
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
                        {userData.firstName || userData.identifier} {userData.lastName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Assigning..." : "Save Assignment"}
              </Button>
            </div>
          </form>
        )}

        {tab === "invite" && (
          <form onSubmit={handleInvite} className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Send an email invitation. Once they accept and join the org, come back here to assign them to the project.
            </p>
            <div className="space-y-2">
              <Label>Client Email</Label>
              <Input name="email" type="email" placeholder="client@example.com" required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
