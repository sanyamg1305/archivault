import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DocumentRow } from "@/components/documents/document-row";
import { FolderOpen } from "lucide-react";

const CATEGORY_ORDER = ["Contract", "Permit", "BOQ", "Drawing", "Other"];

export default async function DocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { orgId } = await auth();
  if (!orgId) return null;

  const supabase = createServiceRoleClient();
  const { data: docs } = await supabase
    .from("project_documents")
    .select("*")
    .eq("project_id", projectId)
    .eq("organization_id", orgId)
    .order("category")
    .order("created_at", { ascending: false });

  // Generate signed download URLs
  const docsWithUrls = await Promise.all((docs ?? []).map(async (d: any) => {
    const { data } = await supabase.storage.from("project-documents")
      .createSignedUrl(d.file_path, 60 * 60);
    return { ...d, signedUrl: data?.signedUrl };
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
