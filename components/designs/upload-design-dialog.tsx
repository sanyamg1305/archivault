"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";
import { useSupabaseBrowser } from "@/utils/supabase/client";

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
import { createDesignAndVersion } from "@/app/actions/designs";

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
  const [uploading, setUploading] = useState(false);
  const { organization, isLoaded } = useOrganization();
  const supabase = useSupabaseBrowser();

  const [title, setTitle] = useState("");
  const [roomId, setRoomId] = useState(defaultRoomId || "none");
  const [file, setFile] = useState<File | null>(null);
  const [changeNotes, setChangeNotes] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !file || !isLoaded || !organization) {
      toast.error("Please fill in all fields and ensure organization is loaded.");
      return;
    }

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only images and PDFs are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File must be under 20 MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading design to storage...");

    try {
      const fileExt = file.name.split('.').pop();
      const designId = crypto.randomUUID();
      const orgId = organization.id;
      const filePath = `${orgId}/${projectId}/${designId}/v1.${fileExt}`;

      // 1. Direct upload from browser to Supabase Storage
      const { error: storageErr } = await supabase.storage
        .from("designs")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (storageErr) throw new Error(storageErr.message);

      toast.loading("Saving design details...", { id: toastId });

      // 2. Call Server Action to write metadata to DB
      await createDesignAndVersion({
        id: designId,
        projectId,
        roomId: roomId === "none" ? null : roomId,
        title,
        filePath,
        changeNotes: changeNotes || "Initial upload",
      });

      toast.success("Design uploaded successfully", { id: toastId });
      setOpen(false);
      // Reset state
      setTitle("");
      setFile(null);
      setChangeNotes("");
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed", {
        id: toastId,
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setUploading(false);
    }
  }

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
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              required 
              placeholder="e.g. Master Bedroom Layout" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomId">Room (Optional)</Label>
            <Select 
              value={roomId} 
              onValueChange={setRoomId}
              disabled={uploading}
            >
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
            <Input 
              id="file" 
              type="file" 
              required 
              accept="image/*,application/pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="changeNotes">Change Notes (Optional)</Label>
            <Input 
              id="changeNotes" 
              placeholder="Initial concept..." 
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={uploading || !isLoaded || !organization} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Design"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
