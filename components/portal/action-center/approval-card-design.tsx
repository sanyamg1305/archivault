"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import { approveItem, requestRevisionItem } from "@/app/actions/approvals";
import { Button } from "@/components/ui/button";
import { FileText, Brush, Check, X, Expand, Search } from "lucide-react";
import { RevisionDialog } from "./revision-dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DesignApprovalProps {
  version: {
    id: string;
    file_path: string;
    version_number: number;
    change_notes: string | null;
    signedUrl?: string;
  };
  design: {
    title: string;
    room?: { name: string } | null;
  };
  projectId: string;
}

export function ApprovalCardDesign({ version, design, projectId }: DesignApprovalProps) {
  const [isPending, startTransition] = useTransition();
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isPdf = version.file_path.endsWith(".pdf");

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveItem("design_version", version.id, projectId, `${design.title} v${version.version_number}`);
        toast.success(`Approved ${design.title} v${version.version_number}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to approve design version");
      }
    });
  };

  const handleRevisionSubmit = (reason: string) => {
    startTransition(async () => {
      try {
        await requestRevisionItem("design_version", version.id, projectId, `${design.title} v${version.version_number}`, reason);
        toast.success(`Revision requested for ${design.title}`);
        setRevisionOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to request revision");
      }
    });
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0 sm:flex sm:items-stretch h-full min-h-[16rem]">
          {/* Left Pane - Image */}
          <div 
            className="h-64 sm:h-auto sm:w-64 relative bg-secondary/30 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border group cursor-pointer shrink-0"
            onClick={() => setLightboxOpen(true)}
          >
            {isPdf ? (
              <FileText className="h-16 w-16 text-muted-foreground group-hover:scale-110 transition-transform" />
            ) : version.signedUrl ? (
              <Image 
                src={version.signedUrl} 
                alt={design.title}
                fill
                unoptimized
                className="object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
               <Brush className="h-16 w-16 text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
               <div className="bg-background/90 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-100 scale-90 shadow-sm text-foreground">
                 <Expand className="w-5 h-5 text-foreground" />
               </div>
            </div>
            <Badge variant="secondary" className="absolute top-4 left-4 font-mono shadow-sm">
              v{version.version_number}
            </Badge>
          </div>

          {/* Middle Pane - Info */}
          <div className="flex-1 p-6 space-y-4 flex flex-col justify-center">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {design.room && (
                  <Badge variant="secondary" className="font-medium bg-secondary/60 hover:bg-secondary/80 text-secondary-foreground">
                    <Brush className="w-3 h-3 mr-1" />
                    {design.room.name}
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-card-foreground">{design.title}</h3>
            </div>
            
            <div className="bg-secondary/20 p-4 rounded-md border border-border/50 mt-2">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Change Notes</p>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{version.change_notes || "No notes provided."}</p>
            </div>
          </div>

          {/* Right Pane - Actions (Uniform with Material Card) */}
          <div className="bg-secondary/10 p-6 sm:w-80 flex flex-col justify-between sm:border-l border-t sm:border-t-0 border-border">
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Design Decision</span>
              </div>
              <div className="text-xl font-bold tracking-tight text-foreground mt-2">
                Action Required
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-snug">
                Review the latest rendering and approve to proceed with layout planning.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <Button
                variant="outline"
                className="flex-1 shrink-0 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setRevisionOpen(true)}
                disabled={isPending}
                size="sm"
              >
                <X className="w-4 h-4 mr-1.5" />
                Revise
              </Button>
              <Button
                className="flex-1 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleApprove}
                disabled={isPending}
                size="sm"
              >
                <Check className="w-4 h-4 mr-1.5" />
                {isPending ? "..." : "Approve"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RevisionDialog
        open={revisionOpen}
        onOpenChange={setRevisionOpen}
        itemName={`${design.title} v${version.version_number}`}
        onSubmit={handleRevisionSubmit}
        isPending={isPending}
      />

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-1 flex flex-col pt-10">
          <DialogTitle className="sr-only">{design.title} Preview</DialogTitle>
          <DialogDescription className="sr-only">Full-screen preview of {design.title}</DialogDescription>
          <div className="flex-1 relative bg-muted rounded-md overflow-hidden flex items-center justify-center m-1">
             {isPdf ? (
                 <iframe 
                   src={version.signedUrl} 
                   className="w-full h-full border-0" 
                   title={`PDF Preview of ${design.title}`}
                 />
              ) : version.signedUrl ? (
                <Image 
                  src={version.signedUrl} 
                  alt={design.title}
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <p>No preview available</p>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
