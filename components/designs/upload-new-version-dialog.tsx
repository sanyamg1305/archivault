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
import { uploadNewVersion } from "@/app/actions/designs";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Uploading..." : "Upload Version"}
    </Button>
  );
}

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
        <form
          action={async (formData) => {
            formData.append("designId", designId);
            formData.append("projectId", projectId);
            formData.append("nextVersion", nextVersion.toString());
            await uploadNewVersion(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" required accept="image/*,application/pdf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="changeNotes">Change Notes</Label>
            <Input id="changeNotes" name="changeNotes" placeholder="What changed in this version?" required />
          </div>
          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
