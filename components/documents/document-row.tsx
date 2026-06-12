"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/app/actions/documents";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentRow({ doc, projectId }: { doc: any; projectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteDocument(doc.id, doc.file_path, projectId);
        toast.success("Document deleted");
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 group transition-colors">
      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{doc.name}</p>
        <p className="text-xs text-muted-foreground">
          {doc.file_size ? formatBytes(doc.file_size) : ""}{" · "}
          {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {doc.signedUrl && (
          <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" download={doc.name}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </a>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={handleDelete} disabled={isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
