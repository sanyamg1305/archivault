import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { DesignCard } from "@/components/designs/design-card";
import { UploadDesignDialog } from "@/components/designs/upload-design-dialog";
import { FolderCard } from "@/components/designs/folders/folder-card";
import { CreateFolderDialog } from "@/components/designs/folders/create-folder-dialog";
import { MoveToFolderDropdown } from "@/components/designs/folders/move-to-folder-dropdown";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function DesignsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ folder?: string }>;
}) {
  const { projectId } = await params;
  const { folder: activeFolderId } = await searchParams;
  const { orgRole } = await auth();
  const isAdmin = orgRole === "org:admin";
  const supabase = createServiceRoleClient();

  const [{ data: rooms }, { data: folders }, { data: designs }] = await Promise.all([
    supabase.from("rooms").select("*").eq("project_id", projectId),
    supabase.from("design_folders").select("*").eq("project_id", projectId).order("name"),
    supabase
      .from("designs")
      .select("*, rooms(name), design_versions(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  ]);

  const allDesigns = designs || [];
  const allFolders = folders || [];

  // Which designs are shown in this view
  const visibleDesigns = activeFolderId
    ? allDesigns.filter((d) => d.folder_id === activeFolderId)
    : allDesigns.filter((d) => !d.folder_id);

  const activeFolder = activeFolderId ? allFolders.find((f) => f.id === activeFolderId) : null;

  const folderDesignCount = (folderId: string) =>
    allDesigns.filter((d) => d.folder_id === folderId).length;

  // Batch all signed URL requests into a single storage API call
  const allPaths = visibleDesigns.flatMap((d) =>
    (d.design_versions || []).map((v: any) => v.file_path).filter(Boolean)
  );
  const { data: signedUrlResults } = allPaths.length
    ? await supabase.storage.from("designs").createSignedUrls(allPaths, 60 * 60 * 24)
    : { data: [] };
  const urlMap = Object.fromEntries(
    (signedUrlResults ?? []).map((r: any) => [r.path, r.signedUrl])
  );

  const designsWithUrls = visibleDesigns.map((design) => {
    const sortedVersions = [...(design.design_versions || [])].sort(
      (a: any, b: any) => b.version_number - a.version_number
    );
    const versionsWithUrls = sortedVersions.map((version: any) => ({
      ...version,
      signedUrl: urlMap[version.file_path] ?? null,
    }));
    const latestVersionWithUrl = versionsWithUrls[0];
    return {
      ...design,
      design_versions: versionsWithUrls,
      signedUrl:
        latestVersionWithUrl && !latestVersionWithUrl.file_path?.endsWith(".pdf")
          ? latestVersionWithUrl.signedUrl
          : null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {activeFolderId ? (
            <>
              <Link
                href={`/projects/${projectId}/designs`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> All Designs
              </Link>
              <span className="text-muted-foreground">/</span>
              <h2 className="text-xl font-semibold">{activeFolder?.name ?? "Folder"}</h2>
            </>
          ) : (
            <h2 className="text-xl font-semibold">Design Drawings & Renders</h2>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!activeFolderId && <CreateFolderDialog projectId={projectId} />}
          <UploadDesignDialog projectId={projectId} rooms={rooms || []} />
        </div>
      </div>

      {/* Folders grid — only on root level */}
      {!activeFolderId && allFolders.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Folders</p>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {allFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                projectId={projectId}
                designCount={folderDesignCount(folder.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Designs grid */}
      {!activeFolderId && allFolders.length > 0 && designsWithUrls.length > 0 && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide -mb-3">Uncategorised</p>
      )}

      {designsWithUrls.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <div className="text-5xl mb-4">🖼️</div>
          <h3 className="font-semibold text-foreground">
            {activeFolderId ? "This folder is empty" : "No designs yet"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs mx-auto">
            {activeFolderId
              ? "Upload a design and move it into this folder to get started."
              : "Upload floor plans, renders, or any design files to share with your client."}
          </p>
          <UploadDesignDialog projectId={projectId} rooms={rooms || []} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designsWithUrls.map((design) => (
            <div key={design.id} className="relative group/designwrap">
              <DesignCard design={design} projectId={projectId} isAdmin={isAdmin} />
              <div className="absolute top-2 left-2 opacity-0 group-hover/designwrap:opacity-100 transition-opacity z-10">
                <MoveToFolderDropdown
                  designId={design.id}
                  projectId={projectId}
                  folders={allFolders}
                  currentFolderId={design.folder_id ?? null}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
