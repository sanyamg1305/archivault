"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadSitePhoto } from "@/app/actions/site-photos";

export function UploadProgressPhotoDialog({ projectId, rooms }: { projectId: string; rooms: any[] }) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("none");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (roomId && roomId !== "none") fd.set("roomId", roomId);
    startTransition(async () => {
      try {
        await uploadSitePhoto(fd);
        toast.success("Photo uploaded");
        setOpen(false);
        setRoomId("none");
        if (fileRef.current) fileRef.current.value = "";
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    });
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
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2">
            <Label htmlFor="pp-file">Photo <span className="text-destructive">*</span></Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click to select or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, HEIC · max 20 MB</p>
              <input ref={fileRef} id="pp-file" name="file" type="file" accept="image/*" required className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pp-date">Date Taken</Label>
              <Input id="pp-date" name="taken_at" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            {rooms.length > 0 && (
              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={roomId} onValueChange={setRoomId}>
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
            <Input id="pp-caption" name="caption" placeholder="e.g. Flooring work in progress" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Uploading…" : "Upload Photo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
