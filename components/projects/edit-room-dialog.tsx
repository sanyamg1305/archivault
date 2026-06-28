"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateRoom } from "@/app/actions/rooms";

const ROOM_TYPES = [
  "Living Room", "Master Bedroom", "Bedroom", "Kitchen", "Dining Room",
  "Bathroom", "Master Bathroom", "Study / Home Office", "Balcony / Terrace",
  "Foyer / Entrance", "Corridor / Hallway", "Pooja Room", "Store Room",
  "Garage", "Other",
];

export function EditRoomDialog({ room, projectId }: { room: any; projectId: string }) {
  const [open, setOpen] = useState(false);
  const [roomType, setRoomType] = useState(room.room_type ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateRoom(projectId, room.id, {
          name: fd.get("name") as string,
          room_type: roomType || undefined,
          floor_area_sqft: fd.get("floor_area_sqft") ? Number(fd.get("floor_area_sqft")) : null,
          ceiling_height_ft: fd.get("ceiling_height_ft") ? Number(fd.get("ceiling_height_ft")) : null,
          notes: fd.get("notes") as string,
        });
        toast.success("Room updated");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update room");
      }
    });
  }

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); setOpen(true); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-background border shadow-sm hover:bg-muted"
        title="Edit room"
      >
        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>Update the name and details for this room.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-room-name">Room Name <span className="text-destructive">*</span></Label>
              <Input id="edit-room-name" name="name" defaultValue={room.name} required />
            </div>

            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <p className="text-sm font-semibold text-foreground">
                Room Information <span className="text-muted-foreground font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-floor-area">Floor Area (sq ft)</Label>
                  <Input
                    id="edit-floor-area"
                    name="floor_area_sqft"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={room.floor_area_sqft ?? ""}
                    placeholder="e.g. 250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ceiling">Ceiling Height (ft)</Label>
                  <Input
                    id="edit-ceiling"
                    name="ceiling_height_ft"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={room.ceiling_height_ft ?? ""}
                    placeholder="e.g. 9.5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  rows={2}
                  defaultValue={room.notes ?? ""}
                  placeholder="e.g. North-facing, existing marble flooring..."
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
