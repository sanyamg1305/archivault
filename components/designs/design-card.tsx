"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, History, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useState } from "react";
import Image from "next/image";

import { UploadNewVersionDialog } from "@/components/designs/upload-new-version-dialog";
import { DesignHistorySheet } from "@/components/designs/design-history-sheet";

export function DesignCard({ design }: { design: any }) {
  const latestVersion = design.design_versions[0]; // Assuming sorted by created_at desc
  const [viewFeedbackVersion, setViewFeedbackVersion] = useState<any>(null);

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
            <p className="text-xs text-muted-foreground">v{latestVersion.version_number} • {design.rooms?.name || 'General'}</p>
          </div>
          <div className="flex flex-col items-end mt-1">
            <Badge variant="outline">{latestVersion.status}</Badge>
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
      <CardFooter className="p-4 pt-0 gap-2 w-full">
        <DesignHistorySheet design={design} />
        <UploadNewVersionDialog 
          designId={design.id} 
          projectId={design.project_id} 
          nextVersion={latestVersion.version_number + 1} 
        />
      </CardFooter>
    </Card>

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
