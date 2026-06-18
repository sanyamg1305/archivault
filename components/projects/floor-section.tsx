"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { renameFloor, deleteFloor } from "@/app/actions/floors";
import { AddRoomToFloorDialog } from "@/components/projects/add-room-to-floor-dialog";

export function FloorSection({
  floor,
  projectId,
  children,
  roomCount,
}: {
  floor: { id: string; name: string };
  projectId: string;
  children: React.ReactNode;
  roomCount: number;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${floor.name}"? Rooms on this floor will be moved to Unassigned.`)) return;
    startTransition(async () => {
      try {
        await deleteFloor(floor.id, projectId);
        toast.success("Floor deleted");
      } catch {
        toast.error("Failed to delete floor");
      }
    });
  }

  function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("name") as string;
    startTransition(async () => {
      try {
        await renameFloor(floor.id, projectId, name);
        toast.success("Floor renamed");
        setRenameOpen(false);
      } catch {
        toast.error("Failed to rename floor");
      }
    });
  }

  return (
    <>
      <div className="space-y-3">
        {/* Floor header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{floor.name}</h3>
            <span className="text-xs text-muted-foreground">
              {roomCount} room{roomCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AddRoomToFloorDialog projectId={projectId} floorId={floor.id} floorName={floor.name} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
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
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Floor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Rooms */}
        {children}
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Rename Floor</DialogTitle>
            <DialogDescription>Enter a new name for this floor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="rename-floor">Floor Name</Label>
              <Input id="rename-floor" name="name" required defaultValue={floor.name} autoFocus />
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
