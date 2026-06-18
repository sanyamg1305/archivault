"use client";

import { useState, useTransition } from "react";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFloor } from "@/app/actions/floors";

const FLOOR_PRESETS = [
  "Basement", "Ground Floor", "First Floor", "Second Floor",
  "Third Floor", "Fourth Floor", "Terrace / Rooftop",
];

export function CreateFloorDialog({
  projectId,
  nextSortOrder,
}: {
  projectId: string;
  nextSortOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = (new FormData(e.currentTarget).get("name") as string).trim();
    startTransition(async () => {
      try {
        await createFloor(projectId, name, nextSortOrder);
        toast.success(`"${name}" added`);
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add floor");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building2 className="h-4 w-4" /> Add Floor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Add Floor</DialogTitle>
          <DialogDescription>Create a floor level for this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="floor-name">Floor Name <span className="text-destructive">*</span></Label>
            <Input id="floor-name" name="name" required placeholder="e.g. Ground Floor" autoFocus />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick select</p>
            <div className="flex flex-wrap gap-2">
              {FLOOR_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="text-xs rounded-full border px-3 py-1 hover:bg-muted transition-colors"
                  onClick={() => {
                    const input = document.getElementById("floor-name") as HTMLInputElement;
                    if (input) input.value = p;
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding…" : "Add Floor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
