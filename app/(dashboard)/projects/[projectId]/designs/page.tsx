import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { DesignCard } from "@/components/designs/design-card";
import { UploadDesignDialog } from "@/components/designs/upload-design-dialog";

export default async function DesignsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClerkSupabaseClient();

  const { data: rooms } = await supabase.from("rooms").select("*").eq("project_id", projectId);

  // Fetch designs with their latest versions
  const { data: designs } = await supabase
    .from("designs")
    .select(`
      *,
      rooms(name),
      design_versions(*)
    `)
    .eq("project_id", projectId)
    .order('created_at', { foreignTable: 'design_versions', ascending: false });

  // Generate signed URLs for private images
  const designsWithUrls = await Promise.all(
    (designs || []).map(async (design) => {
      const latestVersion = design.design_versions?.[0];
      if (latestVersion && !latestVersion.file_path.endsWith('.pdf')) {
        const { data } = await supabase.storage
          .from("designs")
          .createSignedUrl(latestVersion.file_path, 60 * 60 * 24); // 24 hours
        return { ...design, signedUrl: data?.signedUrl };
      }
      return design;
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Design Drawings & Renders</h2>
        <UploadDesignDialog projectId={projectId} rooms={rooms || []} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {designsWithUrls.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </div>
  );
}
