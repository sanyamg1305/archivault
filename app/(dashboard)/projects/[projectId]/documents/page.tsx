import { createServiceRoleClient } from "@/utils/supabase/server";
import { getProjectAccess } from "@/lib/project-access";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DocumentRow } from "@/components/documents/document-row";
import { FolderOpen } from "lucide-react";

const CATEGORY_ORDER = ["Contract", "Permit", "BOQ", "Drawing", "Other"];

export default async function DocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  const orgId = access?.orgId;
  if (!orgId) return null;

  const supabase = createServiceRoleClient();
  const { data: docs } = await supabase
    .from("project_documents")
    .select("*")
    .eq("project_id", projectId)
    .eq("organization_id", orgId)
    .order("category")
    .order("created_at", { ascending: false });

  // Batch signed URLs
  const filePaths = (docs ?? []).map((d: any) => d.file_path).filter(Boolean);
  const { data: signedResults } = filePaths.length
    ? await supabase.storage.from("project-documents").createSignedUrls(filePaths, 60 * 60)
    : { data: [] };
  const urlMap = Object.fromEntries((signedResults ?? []).map((r: any) => [r.path, r.signedUrl]));

  const docsWithUrls = (docs ?? []).map((d: any) => ({
    ...d,
    signedUrl: urlMap[d.file_path] ?? null,
  }));

  const grouped: Record<string, typeof docsWithUrls> = {};
  for (const d of docsWithUrls) {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  }

  const sortedCategories = CATEGORY_ORDER.filter(c => grouped[c]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Document Vault</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{docsWithUrls.length} document{docsWithUrls.length !== 1 ? "s" : ""}</p>
        </div>
        <UploadDocumentDialog projectId={projectId} />
      </div>

      {docsWithUrls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No documents yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload contracts, permits, BOQ, drawings and more.</p>
        </div>
      )}

      {sortedCategories.map(cat => (
        <div key={cat} className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{cat}</h3>
          <div className="border rounded-lg divide-y">
            {grouped[cat].map(doc => (
              <DocumentRow key={doc.id} doc={doc} projectId={projectId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
