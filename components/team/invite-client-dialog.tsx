"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteTeamMember } from "@/app/actions/team";

export function InviteClientDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      try {
        await inviteTeamMember(email.trim(), "org:member");
        toast.success("Client invitation sent", {
          description: `${email} will receive an email to access the client portal.`,
        });
        setOpen(false);
        setEmail("");
      } catch (err) {
        toast.error("Failed to send invite", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Invite a Client</DialogTitle>
          <DialogDescription>
            They'll receive an email invite and get read-only access to approve designs and materials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="client-email">Client email address</Label>
            <Input
              id="client-email"
              type="email"
              required
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The client will get portal access — they can view project progress, review designs, and approve materials. They cannot edit anything.
          </p>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending invite…" : "Send Client Invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
