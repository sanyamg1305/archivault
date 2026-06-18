"use client";

import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, PenLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitSignoff } from "@/app/actions/signoff";

export function ClientSignoffPanel({ projectId }: { projectId: string }) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  const defaultName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress ||
    "";

  const [name, setName] = useState(defaultName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await submitSignoff(projectId, name.trim());
        setConfirmed(true);
        toast.success("Sign-off submitted successfully");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to submit");
      }
    });
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-6">
        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
        <p className="font-semibold text-green-900">Signed off. Thank you!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4 bg-card">
      <div className="flex items-center gap-2 mb-2">
        <PenLine className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Sign off on this project</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        By signing off, you confirm that you have reviewed and accepted all approved materials and designs listed above.
      </p>
      <div className="space-y-2">
        <Label>Your Full Name <span className="text-destructive">*</span></Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your full name to sign"
          required
        />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={isPending || !name.trim()}>
        <CheckCircle2 className="h-4 w-4" />
        {isPending ? "Submitting…" : "I Acknowledge & Sign Off"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        This constitutes a formal digital acknowledgement of the above project summary.
      </p>
    </form>
  );
}
