import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { UploadProgressPhotoDialog } from "@/components/progress/upload-progress-photo-dialog";
import { ProgressPhotoGrid } from "@/components/progress/progress-photo-grid";
import { ImageIcon } from "lucide-react";

export default async function ProgressPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { orgId } = await auth();
  if (!orgId) return null;

  const supabase = createServiceRoleClient();

  const [{ data: photos }, { data: rooms }] = await Promise.all([
    supabase.from("site_photos").select("*, rooms(name)")
      .eq("project_id", projectId).eq("organization_id", orgId)
      .order("taken_at", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("rooms").select("id, name").eq("project_id", projectId).order("name"),
  ]);

  // Generate signed URLs
  const photosWithUrls = await Promise.all((photos ?? []).map(async (p: any) => {
    const { data } = await supabase.storage.from("site-photos").createSignedUrl(p.file_path, 60 * 60 * 24);
    return { ...p, signedUrl: data?.signedUrl };
  }));

  // Group by taken_at date
  const grouped: Record<string, typeof photosWithUrls> = {};
  for (const p of photosWithUrls) {
    const key = p.taken_at;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Site Progress Photos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{photosWithUrls.length} photo{photosWithUrls.length !== 1 ? "s" : ""}</p>
        </div>
        <UploadProgressPhotoDialog projectId={projectId} rooms={rooms ?? []} />
      </div>

      {photosWithUrls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No progress photos yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload site photos to document progress.</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, datePhotos]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h3>
          <ProgressPhotoGrid photos={datePhotos} projectId={projectId} />
        </div>
      ))}
    </div>
  );
}
