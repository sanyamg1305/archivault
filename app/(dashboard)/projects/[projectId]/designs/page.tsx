import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { DesignCard } from "@/components/designs/design-card";
import { UploadDesignDialog } from "@/components/designs/upload-design-dialog";

export default async function DesignsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  await auth(); // ensure authenticated
  const supabase = createServiceRoleClient();

  const { data: rooms } = await supabase.from("rooms").select("*").eq("project_id", projectId);

  const { data: designs } = await supabase
    .from("designs")
    .select("*, rooms(name), design_versions(*)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const designsWithUrls = await Promise.all(
    (designs || []).map(async (design) => {
      const sortedVersions = [...(design.design_versions || [])].sort(
        (a: any, b: any) => b.version_number - a.version_number
      );
      const versionsWithUrls = await Promise.all(
        sortedVersions.map(async (version: any) => {
          const { data } = await supabase.storage
            .from("designs")
            .createSignedUrl(version.file_path, 60 * 60 * 24);
          return { ...version, signedUrl: data?.signedUrl };
        })
      );
      
      const latestVersionWithUrl = versionsWithUrls[0];
      return { 
        ...design, 
        design_versions: versionsWithUrls,
        signedUrl: latestVersionWithUrl && !latestVersionWithUrl.file_path.endsWith('.pdf') ? latestVersionWithUrl.signedUrl : null
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Design Drawings & Renders</h2>
        <UploadDesignDialog projectId={projectId} rooms={rooms || []} />
      </div>

      {designsWithUrls.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed rounded-lg bg-slate-50/50">
          <p className="font-medium text-muted-foreground">No designs uploaded for this project yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Upload a design to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designsWithUrls.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}
