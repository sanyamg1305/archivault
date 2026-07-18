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
import { createDocumentRecord } from "@/app/actions/documents";

const CATEGORIES = ["Contract", "Permit", "BOQ", "Drawing", "Other"];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg", "image/png", "image/webp",
  "text/plain",
];

export function UploadDocumentDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Other");
  const [fileName, setFileName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { organization, isLoaded } = useOrganization();
  const supabase = useSupabaseBrowser();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !isLoaded || !organization) {
      toast.error("Please select a file and wait for organization context.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("File type not allowed");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File must be under 50 MB");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading document to storage...");

    try {
      const ext = file.name.split(".").pop();
      const orgId = organization.id;
      const finalName = displayName.trim() || file.name;
      const path = `${orgId}/${projectId}/${Date.now()}_${finalName.replace(/[^a-z0-9]/gi, "_")}.${ext}`;

      // 1. Direct upload from browser to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      toast.loading("Saving document details...", { id: toastId });

      // 2. Call Server Action to write metadata to DB
      await createDocumentRecord({
        projectId,
        name: finalName,
        filePath: path,
        fileSize: file.size,
        mimeType: file.type,
        category,
      });

      toast.success("Document uploaded successfully", { id: toastId });
      setOpen(false);
      setCategory("Other");
      setFileName("");
      setDisplayName("");
      setFile(null);
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
        <Button className="gap-2"><Plus className="h-4 w-4" /> Upload Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>PDF, Word, Excel, images — max 50 MB.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label>File <span className="text-destructive">*</span></Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              {fileName ? (
                <p className="text-sm font-medium truncate max-w-full px-4">{fileName}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Click to select a file</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, images</p>
                </>
              )}
              <input
                ref={fileRef} 
                type="file" 
                required
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
                className="hidden"
                disabled={uploading}
                onChange={e => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  setFileName(selectedFile?.name ?? "");
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-name">Display Name</Label>
            <Input 
              id="doc-name" 
              placeholder="Leave blank to use filename" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={uploading}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={uploading || !isLoaded || !organization}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
