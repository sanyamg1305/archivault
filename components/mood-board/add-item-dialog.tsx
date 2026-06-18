"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Link2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addMoodBoardImage, addMoodBoardLink } from "@/app/actions/mood-board";

export function AddMoodBoardItemDialog({
  projectId,
  rooms,
}: {
  projectId: string;
  rooms: { id: string; name: string }[];
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [roomId, setRoomId] = useState("none");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addedByName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress ||
    "Unknown";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  function handleImageSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("projectId", projectId);
    fd.set("addedByName", addedByName);
    if (roomId !== "none") fd.set("roomId", roomId);
    startTransition(async () => {
      try {
        await addMoodBoardImage(fd);
        toast.success("Image added to mood board");
        setOpen(false);
        setPreview(null);
        setRoomId("none");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function handleLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addMoodBoardLink({
          projectId,
          roomId: roomId !== "none" ? roomId : undefined,
          linkUrl: fd.get("linkUrl") as string,
          title: (fd.get("title") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
          addedByName,
        });
        toast.success("Link added to mood board");
        setOpen(false);
        setRoomId("none");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  const RoomSelect = () => (
    <div className="space-y-1.5">
      <Label>Room <span className="text-muted-foreground font-normal">(optional)</span></Label>
      <Select value={roomId} onValueChange={setRoomId}>
        <SelectTrigger><SelectValue placeholder="General / No room" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">General</SelectItem>
          {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setPreview(null); setRoomId("none"); } }}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Inspiration</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add to Mood Board</DialogTitle>
          <DialogDescription>Upload an image or paste a reference link.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="image" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="image" className="flex-1 gap-2"><ImagePlus className="h-4 w-4" /> Image</TabsTrigger>
            <TabsTrigger value="link" className="flex-1 gap-2"><Link2 className="h-4 w-4" /> Link</TabsTrigger>
          </TabsList>

          {/* Image tab */}
          <TabsContent value="image">
            <form onSubmit={handleImageSubmit} className="space-y-4 pt-2">
              <div
                className="relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 20 MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" name="file" accept="image/*" className="hidden" onChange={handleFileChange} required />
              </div>
              <Input name="title" placeholder="Title (optional)" />
              <Textarea name="notes" placeholder="Notes or description (optional)" rows={2} />
              <RoomSelect />
              <Button type="submit" className="w-full" disabled={isPending || !preview}>
                {isPending ? "Uploading…" : "Add Image"}
              </Button>
            </form>
          </TabsContent>

          {/* Link tab */}
          <TabsContent value="link">
            <form onSubmit={handleLinkSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>URL <span className="text-destructive">*</span></Label>
                <Input name="linkUrl" placeholder="https://pinterest.com/..." required />
              </div>
              <Input name="title" placeholder="Title (optional)" />
              <Textarea name="notes" placeholder="Notes or description (optional)" rows={2} />
              <RoomSelect />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Adding…" : "Add Link"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
