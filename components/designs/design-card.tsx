"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, History, Upload, Check, X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import Image from "next/image";

import { UploadNewVersionDialog } from "@/components/designs/upload-new-version-dialog";
import { DesignHistorySheet } from "@/components/designs/design-history-sheet";
import { RevisionDialog } from "@/components/portal/action-center/revision-dialog";
import { approveItem, requestRevisionItem } from "@/app/actions/approvals";
import { deleteDesign } from "@/app/actions/designs";
import { toast } from "sonner";

export function DesignCard({ design, approvalMode, projectId, isAdmin }: { design: any; approvalMode?: boolean; projectId?: string; isAdmin?: boolean }) {
  const latestVersion = design.design_versions[0]; // Assuming sorted by created_at desc
  const [viewFeedbackVersion, setViewFeedbackVersion] = useState<any>(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const showApprovalButtons = approvalMode && projectId && latestVersion?.status === "Pending";

  const handleApprove = () => {
    if (!projectId) return;
    startTransition(async () => {
      try {
        await approveItem("design_version", latestVersion.id, projectId, `${design.title} v${latestVersion.version_number}`);
        toast.success(`Approved ${design.title}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to approve");
      }
    });
  };

  const handleRevisionSubmit = (reason: string) => {
    if (!projectId) return;
    startTransition(async () => {
      try {
        await requestRevisionItem("design_version", latestVersion.id, projectId, `${design.title} v${latestVersion.version_number}`, reason);
        toast.success("Revision requested");
        setRevisionOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to request revision");
      }
    });
  };

  function handleDelete() {
    if (!projectId) return;
    startTransition(async () => {
      try {
        await deleteDesign(design.id, projectId);
        toast.success(`"${design.title}" deleted`);
        setDeleteOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete design");
      }
    });
  }

  return (
    <>
      <Card className="overflow-hidden">
      <div className="h-52 w-full bg-slate-100 flex items-center justify-center border-b relative">
        {latestVersion.file_path.endsWith('.pdf') ? (
          <FileText className="h-12 w-12 text-slate-400" />
        ) : (
           <Image 
            src={latestVersion.signedUrl || design.signedUrl || ""} 
            alt={design.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
           />
        )}
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{design.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              v{latestVersion.version_number} • {design.rooms?.name || 'General'} •{' '}
              {(() => {
                const diff = Date.now() - new Date(latestVersion.created_at).getTime();
                const days = Math.floor(diff / 86400000);
                if (days === 0) return 'today';
                if (days === 1) return 'yesterday';
                if (days < 30) return `${days}d ago`;
                if (days < 365) return `${Math.floor(days / 30)}mo ago`;
                return `${Math.floor(days / 365)}y ago`;
              })()}
            </p>
          </div>
          <div className="flex flex-col items-end mt-1 gap-1">
            <div className="flex items-center gap-1">
              {isAdmin && !approvalMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Badge variant="outline">{latestVersion.status}</Badge>
            </div>
            {latestVersion.status === "Revision Requested" && latestVersion.revision_note && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 mt-1"
                onClick={() => setViewFeedbackVersion(latestVersion)}
              >
                View Feedback
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0 gap-2 w-full flex-col">
        {showApprovalButtons && (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={() => setRevisionOpen(true)}
              disabled={isPending}
            >
              <X className="h-4 w-4 mr-1.5" /> Revise
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleApprove}
              disabled={isPending}
            >
              <Check className="h-4 w-4 mr-1.5" /> {isPending ? "..." : "Approve"}
            </Button>
          </div>
        )}
        {!approvalMode && (
          <div className="flex gap-2 w-full">
            <DesignHistorySheet design={design} />
            <UploadNewVersionDialog
              designId={design.id}
              projectId={design.project_id}
              nextVersion={latestVersion.version_number + 1}
            />
          </div>
        )}
      </CardFooter>
    </Card>

      {showApprovalButtons && (
        <RevisionDialog
          open={revisionOpen}
          onOpenChange={setRevisionOpen}
          itemName={`${design.title} v${latestVersion.version_number}`}
          onSubmit={handleRevisionSubmit}
          isPending={isPending}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete design?</DialogTitle>
            <DialogDescription>
              This will permanently delete <span className="font-semibold text-foreground">"{design.title}"</span> and all its versions and files. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewFeedbackVersion && (
        <Dialog open={!!viewFeedbackVersion} onOpenChange={(open) => !open && setViewFeedbackVersion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revision Feedback</DialogTitle>
              <DialogDescription>
                Client requested changes for design version <span className="font-semibold text-foreground">v{viewFeedbackVersion.version_number}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border p-4 bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap mt-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70 block mb-2">Request Details</span>
              {viewFeedbackVersion.revision_note}
            </div>
            <div className="mt-2 flex justify-end">
              <Button onClick={() => setViewFeedbackVersion(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
