"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateProjectNotes } from "@/app/actions/projects";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";

export function ProjectNotes({ projectId, initialNotes }: { projectId: string; initialNotes?: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProjectNotes(projectId, value);
        toast.success("Notes saved");
        setEditing(false);
      } catch {
        toast.error("Failed to save notes");
      }
    });
  };

  const handleCancel = () => {
    setValue(initialNotes ?? "");
    setEditing(false);
  };

  return (
    <div className="space-y-2">
      {editing ? (
        <>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add project notes, scope, or any relevant context..."
            rows={4}
            disabled={isPending}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              <Check className="h-4 w-4 mr-1" /> {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </>
      ) : (
        <div
          className="group min-h-[60px] rounded-md border border-transparent hover:border-border p-3 cursor-pointer transition-colors relative"
          onClick={() => setEditing(true)}
        >
          {value ? (
            <p className="text-sm whitespace-pre-wrap text-foreground/80">{value}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Click to add project notes...</p>
          )}
          <Pencil className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}
