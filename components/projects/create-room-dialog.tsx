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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createRoom } from "@/app/actions/rooms";
import { toast } from "sonner";

const ROOM_TYPES = [
  "Living Room", "Master Bedroom", "Bedroom", "Kitchen", "Dining Room",
  "Bathroom", "Master Bathroom", "Study / Home Office", "Balcony / Terrace",
  "Foyer / Entrance", "Corridor / Hallway", "Pooja Room", "Store Room",
  "Garage", "Other",
];

export function CreateRoomDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomType, setRoomType] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const floor_area_sqft = formData.get("floor_area_sqft") ? Number(formData.get("floor_area_sqft")) : null;
    const ceiling_height_ft = formData.get("ceiling_height_ft") ? Number(formData.get("ceiling_height_ft")) : null;
    const notes = formData.get("notes") as string;

    try {
      await createRoom(projectId, { name, room_type: roomType, floor_area_sqft, ceiling_height_ft, notes });
      setOpen(false);
      setRoomType("");
      toast.success("Room added", { description: `"${name}" is ready.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast.error("Error", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setRoomType(""); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <DialogDescription>
            Create a new space within this project (e.g. Kitchen, Living Room).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="room-name">Room Name <span className="text-destructive">*</span></Label>
              <Input id="room-name" name="name" placeholder="e.g. Master Bedroom" required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Room Information */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Room Information <span className="text-muted-foreground font-normal">(optional)</span></p>
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
              <Textarea id="notes" name="notes" placeholder="e.g. North-facing, needs blackout curtains, existing marble flooring..." rows={2} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Room"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
