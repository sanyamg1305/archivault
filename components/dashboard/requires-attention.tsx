"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Clock, FileImage, FolderOpen, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ActionItem = {
  id: string;
  type: "material" | "design";
  title: string;
  status: string;
  projectId: string;
  projectName: string;
};

function ProjectGroup({ projectId, projectName, items }: { projectId: string; projectName: string; items: ActionItem[] }) {
  const [open, setOpen] = useState(true);
  const revisionCount = items.filter(i => i.status === "Revision Requested").length;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm truncate">{projectName}</span>
          <Badge variant="secondary" className="text-xs shrink-0">{items.length}</Badge>
          {revisionCount > 0 && (
            <Badge variant="destructive" className="text-xs shrink-0">{revisionCount} revision{revisionCount > 1 ? "s" : ""}</Badge>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Items */}
      {open && (
        <div className="divide-y divide-border">
          {items.map(item => (
            <Link
              key={`${item.type}-${item.id}`}
              href={`/projects/${item.projectId}/${item.type}s`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-md bg-secondary text-secondary-foreground shrink-0">
                  {item.type === "material" ? (
                    <Layers className="h-3.5 w-3.5" />
                  ) : (
                    <FileImage className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate flex items-center gap-2">
                    {item.title}
                    {item.status === "Revision Requested" && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm shrink-0">
                        Revision
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 opacity-70" />
                  {item.status === "Revision Requested" ? "Take action" : "Waiting on client"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function RequiresAttention({ actionItems }: { actionItems: ActionItem[] }) {
  const totalCount = actionItems.length;

  // Group by project, revision items first within each group
  const grouped = actionItems.reduce((acc, item) => {
    if (!acc[item.projectId]) {
      acc[item.projectId] = { projectName: item.projectName, items: [] };
    }
    acc[item.projectId].items.push(item);
    return acc;
  }, {} as Record<string, { projectName: string; items: ActionItem[] }>);

  // Sort each group: revisions first
  for (const g of Object.values(grouped)) {
    g.items.sort((a, b) => {
      if (a.status === "Revision Requested" && b.status !== "Revision Requested") return -1;
      if (b.status === "Revision Requested" && a.status !== "Revision Requested") return 1;
      return 0;
    });
  }

  // Sort project groups: those with revisions first
  const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => {
    const aHasRevision = a.items.some(i => i.status === "Revision Requested");
    const bHasRevision = b.items.some(i => i.status === "Revision Requested");
    if (aHasRevision && !bHasRevision) return -1;
    if (bHasRevision && !aHasRevision) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Requires Attention
        </h2>
        {totalCount > 0 && (
          <Badge variant="secondary" className="px-3 py-1 font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            {totalCount} Pending
          </Badge>
        )}
      </div>

      {totalCount === 0 ? (
        <Card className="border-muted shadow-sm">
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              There are no pending materials or design revisions requiring your attention right now.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map(([projectId, { projectName, items }]) => (
            <ProjectGroup
              key={projectId}
              projectId={projectId}
              projectName={projectName}
              items={items}
            />
          ))}
        </div>
      )}
    </div>
  );
}
