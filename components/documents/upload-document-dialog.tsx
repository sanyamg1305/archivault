"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadDocument } from "@/app/actions/documents";

const CATEGORIES = ["Contract", "Permit", "BOQ", "Drawing", "Other"];

export function UploadDocumentDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Other");
  const [fileName, setFileName] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("category", category);
    startTransition(async () => {
      try {
        await uploadDocument(fd);
        toast.success("Document uploaded");
        setOpen(false);
        setCategory("Other");
        setFileName("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    });
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
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2">
            <Label>File <span className="text-destructive">*</span></Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              {fileName
                ? <p className="text-sm font-medium">{fileName}</p>
                : <><p className="text-sm text-muted-foreground">Click to select a file</p><p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, images</p></>}
              <input
                ref={fileRef} name="file" type="file" required
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
                className="hidden"
                onChange={e => setFileName(e.target.files?.[0]?.name ?? "")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-name">Display Name</Label>
            <Input id="doc-name" name="name" placeholder="Leave blank to use filename" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
