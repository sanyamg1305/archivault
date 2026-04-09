"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadDesign } from "@/app/actions/designs";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Uploading..." : "Upload Design"}
    </Button>
  );
}

export function UploadDesignDialog({
  projectId,
  rooms,
  defaultRoomId,
}: {
  projectId: string;
  rooms: any[];
  defaultRoomId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" /> Upload Design
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Design</DialogTitle>
          <DialogDescription>
            Upload a drawing or render. It will be tracked as version 1.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            formData.append("projectId", projectId);
            await uploadDesign(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Master Bedroom Layout" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomId">Room (Optional)</Label>
            <Select name="roomId" defaultValue={defaultRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General / Project Wide</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" required accept="image/*,application/pdf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="changeNotes">Change Notes (Optional)</Label>
            <Input id="changeNotes" name="changeNotes" placeholder="Initial concept..." />
          </div>
          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
