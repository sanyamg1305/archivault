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
import { createDesignVersion } from "@/app/actions/designs";

export function UploadNewVersionDialog({
  designId,
  projectId,
  nextVersion,
}: {
  designId: string;
  projectId: string;
  nextVersion: number;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { organization, isLoaded } = useOrganization();
  const supabase = useSupabaseBrowser();

  const [file, setFile] = useState<File | null>(null);
  const [changeNotes, setChangeNotes] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !isLoaded || !organization || !changeNotes.trim()) {
      toast.error("Please fill in all fields.");
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
    const toastId = toast.loading("Uploading design version to storage...");

    try {
      const fileExt = file.name.split('.').pop();
      const orgId = organization.id;
      const filePath = `${orgId}/${projectId}/${designId}/v${nextVersion}.${fileExt}`;

      // 1. Direct upload from browser to Supabase Storage
      const { error: storageErr } = await supabase.storage
        .from("designs")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (storageErr) throw new Error(storageErr.message);

      toast.loading("Saving version details...", { id: toastId });

      // 2. Call Server Action to write metadata to DB
      await createDesignVersion({
        designId,
        filePath,
        versionNumber: nextVersion,
        changeNotes,
        projectId,
      });

      toast.success(`Version ${nextVersion} uploaded successfully`, { id: toastId });
      setOpen(false);
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
        <Button variant="outline" size="sm" className="flex-1 gap-2">
          <Upload className="h-4 w-4" /> New Version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Version {nextVersion}</DialogTitle>
          <DialogDescription>
            Add a new revision to this design stack.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
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
            <Label htmlFor="changeNotes">Change Notes</Label>
            <Input 
              id="changeNotes" 
              placeholder="What changed in this version?" 
              required 
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
                "Upload Version"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
