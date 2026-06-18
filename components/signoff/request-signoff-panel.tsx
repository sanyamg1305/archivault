"use client";

import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { requestSignoff } from "@/app/actions/signoff";

export function RequestSignoffPanel({
  projectId,
  approvedMaterialCount,
  approvedDesignCount,
}: {
  projectId: string;
  approvedMaterialCount: number;
  approvedDesignCount: number;
}) {
  const { user } = useUser();
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress ||
    "Architect";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await requestSignoff(projectId, notes, name);
        toast.success("Sign-off requested — client has been notified");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border p-6">
      <div>
        <h3 className="font-semibold">Request Client Sign-off</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This will send a sign-off request to the client portal covering {approvedMaterialCount} approved material{approvedMaterialCount !== 1 ? "s" : ""} and {approvedDesignCount} approved design{approvedDesignCount !== 1 ? "s" : ""}.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Notes to client <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Please review all approved items and formally acknowledge this summary."
          rows={3}
        />
      </div>
      <Button type="submit" className="gap-2" disabled={isPending || (approvedMaterialCount === 0 && approvedDesignCount === 0)}>
        <Send className="h-4 w-4" />
        {isPending ? "Sending…" : "Request Sign-off"}
      </Button>
      {approvedMaterialCount === 0 && approvedDesignCount === 0 && (
        <p className="text-xs text-muted-foreground">No approved items yet — approve materials or designs first.</p>
      )}
    </form>
  );
}
