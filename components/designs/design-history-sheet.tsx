"use client";

import { History, FileText } from "lucide-react";
import Image from "next/image";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function DesignHistorySheet({ design }: { design: any }) {
  // Sort versions by version_number descending to show the newest on top
  const versions = [...design.design_versions].sort((a, b) => b.version_number - a.version_number);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex-1 gap-2">
          <History className="h-4 w-4" /> History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto border-l">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>
            Tracking revisions for <strong>{design.title}</strong>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 pt-4 space-y-6">
          {versions.map((version: any) => (
            <div key={version.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold rounded-full bg-slate-100 py-1 px-3">v{version.version_number}</span>
                  <Badge variant={version.status === "Approved" ? "default" : "secondary"}>
                    {version.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                   {new Date(version.created_at).toLocaleDateString(undefined, { 
                     month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                   })}
                </span>
              </div>
              
              {version.signedUrl && (
                <div className="w-full relative rounded-md overflow-hidden bg-slate-100 border">
                  {version.file_path?.endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center py-6 h-32">
                      <FileText className="h-8 w-8 text-slate-400 mb-2" />
                      <a href={version.signedUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">View PDF</Button>
                      </a>
                    </div>
                  ) : (
                    <a href={version.signedUrl} target="_blank" rel="noopener noreferrer" className="block relative h-40 w-full group">
                      <Image 
                        src={version.signedUrl} 
                        alt={`Version ${version.version_number}`}
                        fill
                        unoptimized
                        className="object-cover transition-opacity group-hover:opacity-90"
                      />
                    </a>
                  )}
                </div>
              )}

              <div className="bg-slate-50/50 border p-3 rounded-md text-sm text-slate-700">
                  <p className="font-medium mb-1 text-slate-900">Change Notes</p>
                  <p>{version.change_notes || <span className="text-muted-foreground italic">No notes provided.</span>}</p>
              </div>
              
              {version.revision_note && (
                <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-md text-sm text-blue-800 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-200">
                    <p className="font-semibold text-[10px] uppercase tracking-wider mb-1 opacity-80">Client Feedback</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{version.revision_note}</p>
                </div>
              )}
              
              <Separator />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
