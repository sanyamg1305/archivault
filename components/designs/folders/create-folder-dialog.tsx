"use client";

import { useState, useTransition } from "react";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDesignFolder } from "@/app/actions/design-folders";

export function CreateFolderDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = (new FormData(e.currentTarget).get("name") as string).trim();
    startTransition(async () => {
      try {
        await createDesignFolder(projectId, name);
        toast.success("Folder created");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderPlus className="h-4 w-4" /> New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
          <DialogDescription>Create a folder to organise your designs.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input id="folder-name" name="name" required placeholder="e.g. Floor Plans, 3D Renders" autoFocus />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating…" : "Create Folder"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
