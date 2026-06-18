"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createRoom } from "@/app/actions/rooms";

const ROOM_TYPES = [
  "Living Room", "Master Bedroom", "Bedroom", "Kitchen", "Dining Room",
  "Bathroom", "Master Bathroom", "Study / Home Office", "Balcony / Terrace",
  "Foyer / Entrance", "Corridor / Hallway", "Pooja Room", "Store Room",
  "Garage", "Other",
];

export function AddRoomToFloorDialog({
  projectId,
  floorId,
  floorName,
}: {
  projectId: string;
  floorId: string;
  floorName: string;
}) {
  const [open, setOpen] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const floor_area_sqft = fd.get("floor_area_sqft") ? Number(fd.get("floor_area_sqft")) : null;
    const ceiling_height_ft = fd.get("ceiling_height_ft") ? Number(fd.get("ceiling_height_ft")) : null;
    const notes = fd.get("notes") as string;

    startTransition(async () => {
      try {
        await createRoom(projectId, {
          name,
          room_type: roomType || undefined,
          floor_area_sqft,
          ceiling_height_ft,
          notes,
          floor_id: floorId,
        });
        toast.success("Room added", { description: `"${name}" added to ${floorName}` });
        setOpen(false);
        setRoomType("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setRoomType(""); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Room — {floorName}</DialogTitle>
          <DialogDescription>Create a new space on this floor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="room-name">Room Name <span className="text-destructive">*</span></Label>
              <Input id="room-name" name="name" placeholder="e.g. Master Bedroom" required autoFocus />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <p className="text-sm font-semibold">Room Information <span className="text-muted-foreground font-normal">(optional)</span></p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor_area">Floor Area (sq ft)</Label>
                <Input id="floor_area" name="floor_area_sqft" type="number" step="0.1" min="0" placeholder="e.g. 250" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ceiling_height">Ceiling Height (ft)</Label>
                <Input id="ceiling_height" name="ceiling_height_ft" type="number" step="0.1" min="0" placeholder="e.g. 9.5" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="e.g. North-facing, existing marble flooring…" rows={2} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding…" : "Add Room"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
