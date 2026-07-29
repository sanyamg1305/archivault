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
    <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-card/40 backdrop-blur-md">
      {/* Group header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-muted/10 hover:bg-muted/30 transition-colors text-left border-b border-border/40"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FolderOpen className="h-4 w-4 text-[#2F5BFF] shrink-0" />
          <span className="font-semibold text-sm truncate text-foreground">{projectName}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#eaefff] text-[#2F5BFF] shrink-0">
            {items.length}
          </span>
          {revisionCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 shrink-0">
              {revisionCount} revision{revisionCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground/80 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground/80 shrink-0" />
        )}
      </button>

      {/* Items */}
      {open && (
        <div className="divide-y divide-border/40 bg-card/10">
          {items.map(item => (
            <Link
              key={`${item.type}-${item.id}`}
              href={`/projects/${item.projectId}/${item.type}s`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2 rounded-lg bg-[#2F5BFF]/5 text-[#2F5BFF] group-hover:bg-[#2F5BFF] group-hover:text-white transition-all duration-300 shrink-0">
                  {item.type === "material" ? (
                    <Layers className="h-4 w-4" />
                  ) : (
                    <FileImage className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-[#2F5BFF] transition-colors truncate flex items-center gap-2">
                    {item.title}
                    {item.status === "Revision Requested" && (
                      <span className="text-[9px] uppercase tracking-wider font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-sm shrink-0">
                        Revision
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 capitalize mt-0.5">{item.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-muted-foreground/80 hidden sm:flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  {item.status === "Revision Requested" ? "Take action" : "Waiting on client"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#2F5BFF] group-hover:translate-x-0.5 transition-all duration-300" />
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
        <h2 className="text-xl font-bold flex items-center gap-2.5 text-foreground tracking-tight">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Requires Attention
        </h2>
        {totalCount > 0 && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600">
            {totalCount} Pending
          </span>
        )}
      </div>

      {totalCount === 0 ? (
        <Card className="border-border/60 shadow-sm bg-card/40 backdrop-blur-md rounded-xl">
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-green-600 animate-pulse">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">All caught up!</h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
              There are no pending materials or design revisions requiring your attention right now.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3.5">
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
