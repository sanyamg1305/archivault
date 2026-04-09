"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onSubmit: (reason: string) => void;
  isPending: boolean;
}

export function RevisionDialog({ open, onOpenChange, itemName, onSubmit, isPending }: RevisionDialogProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) onOpenChange(val);
      if (!val) setReason("");
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Revision</DialogTitle>
          <DialogDescription>
            Please provide details on what needs to be changed for <strong>{itemName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            placeholder="Type your feedback here..." 
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
            disabled={isPending}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!reason.trim() || isPending}>
            {isPending ? "Submitting..." : "Submit Revision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
