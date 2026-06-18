"use client";

import { useState, useTransition } from "react";
import { Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteDesignFolder, renameDesignFolder } from "@/app/actions/design-folders";

export function FolderCard({
  folder,
  projectId,
  designCount,
}: {
  folder: { id: string; name: string };
  projectId: string;
  designCount: number;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteDesignFolder(folder.id, projectId);
        toast.success("Folder deleted — designs moved to root");
      } catch {
        toast.error("Failed to delete folder");
      }
    });
  }

  function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("name") as string;
    startTransition(async () => {
      try {
        await renameDesignFolder(folder.id, projectId, name);
        toast.success("Folder renamed");
        setRenameOpen(false);
      } catch {
        toast.error("Failed to rename");
      }
    });
  }

  return (
    <>
      <div
        className="group relative flex flex-col items-start gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
        onClick={() => router.push(`/projects/${projectId}/designs?folder=${folder.id}`)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Folder className="h-5 w-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={e => { e.preventDefault(); setRenameOpen(true); }}>
                <Pencil className="h-4 w-4 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={e => { e.preventDefault(); handleDelete(); }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <p className="font-semibold text-sm">{folder.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {designCount} design{designCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for this folder.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="rename-input">Folder Name</Label>
              <Input id="rename-input" name="name" required defaultValue={folder.name} autoFocus />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving…" : "Rename"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
