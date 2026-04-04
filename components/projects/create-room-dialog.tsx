"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
import { createRoom } from "@/app/actions/rooms";
import { toast } from "sonner";

export function CreateRoomDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    try {
      await createRoom(projectId, name);
      setOpen(false);
      toast.success("Room added", { description: `"${name}" is ready.` });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error("Error", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <DialogDescription>
            Create a new space within this project (e.g. Kitchen, Living Room).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              name="name"
              placeholder="e.g. Master Bedroom"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Room"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
