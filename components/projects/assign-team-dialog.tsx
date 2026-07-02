"use client";

import { useState, useTransition } from "react";
import { Users2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { assignArchitectToProject, unassignArchitectFromProject } from "@/app/actions/project-members";

type Architect = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  assigned: boolean;
};

export function AssignTeamDialog({
  projectId,
  architects,
}: {
  projectId: string;
  architects: Architect[];
}) {
  const [open, setOpen] = useState(false);
  const [assigned, setAssigned] = useState<Set<string>>(
    new Set(architects.filter((a) => a.assigned).map((a) => a.userId))
  );
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function toggle(userId: string) {
    setLoadingId(userId);
    const isCurrentlyAssigned = assigned.has(userId);
    startTransition(async () => {
      try {
        if (isCurrentlyAssigned) {
          await unassignArchitectFromProject(projectId, userId);
          setAssigned((prev) => { const s = new Set(prev); s.delete(userId); return s; });
          toast.success("Team member unassigned");
        } else {
          await assignArchitectToProject(projectId, userId);
          setAssigned((prev) => new Set([...prev, userId]));
          toast.success("Team member assigned");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update assignment");
      } finally {
        setLoadingId(null);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users2 className="h-4 w-4" />
          Assign Team
          {assigned.size > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {assigned.size}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
        </DialogHeader>
        {architects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No team members yet. Invite architects from the Team page.
          </p>
        ) : (
          <div className="space-y-2 py-2">
            {architects.map((a) => {
              const isAssigned = assigned.has(a.userId);
              const isLoading = loadingId === a.userId && pending;
              return (
                <button
                  key={a.userId}
                  onClick={() => toggle(a.userId)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    isAssigned
                      ? "bg-primary/5 border-primary/30"
                      : "bg-background border-muted hover:bg-muted/50"
                  }`}
                >
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground">
                      {(a.firstName?.[0] ?? a.email[0] ?? "?").toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {a.firstName || a.lastName ? `${a.firstName} ${a.lastName}`.trim() : a.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                  </div>
                  <div className="shrink-0">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isAssigned ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
