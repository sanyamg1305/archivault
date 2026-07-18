"use client";

import { useState, useRef } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";
import { useSupabaseBrowser } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSitePhotoRecord } from "@/app/actions/site-photos";

export function UploadProgressPhotoDialog({ projectId, rooms }: { projectId: string; rooms: any[] }) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("none");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split("T")[0]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { organization, isLoaded } = useOrganization();
  const supabase = useSupabaseBrowser();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !isLoaded || !organization) {
      toast.error("Please select a file and wait for organization context.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"].includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, GIF, or HEIC images are allowed.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20 MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading progress photo to storage...");

    try {
      const ext = file.name.split(".").pop();
      const orgId = organization.id;
      const path = `${orgId}/${projectId}/${Date.now()}.${ext}`;

      // 1. Direct upload from browser to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("site-photos")
        .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      toast.loading("Saving photo details...", { id: toastId });

      // 2. Call Server Action to write metadata to DB
      await createSitePhotoRecord({
        projectId,
        roomId: roomId === "none" ? null : roomId,
        filePath: path,
        caption: caption || null,
        takenAt: takenAt,
      });

      toast.success("Progress photo uploaded successfully", { id: toastId });
      setOpen(false);
      setRoomId("none");
      setFile(null);
      setCaption("");
      setTakenAt(new Date().toISOString().split("T")[0]);
      if (fileRef.current) fileRef.current.value = "";
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
        <Button className="gap-2"><Plus className="h-4 w-4" /> Upload Photo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Upload Progress Photo</DialogTitle>
          <DialogDescription>Document site progress with a photo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="pp-file">Photo <span className="text-destructive">*</span></Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              {file ? (
                <p className="text-sm font-medium text-primary truncate max-w-full px-4">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Click to select or drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, HEIC · max 20 MB</p>
                </>
              )}
              <input 
                ref={fileRef} 
                id="pp-file" 
                type="file" 
                accept="image/*" 
                required 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pp-date">Date Taken</Label>
              <Input 
                id="pp-date" 
                type="date" 
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                disabled={uploading}
              />
            </div>
            {rooms.length > 0 && (
              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={roomId} onValueChange={setRoomId} disabled={uploading}>
                  <SelectTrigger><SelectValue placeholder="Any room" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific room</SelectItem>
                    {rooms.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-caption">Caption</Label>
            <Input 
              id="pp-caption" 
              placeholder="e.g. Flooring work in progress" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={uploading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={uploading || !isLoaded || !organization}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload Photo"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
