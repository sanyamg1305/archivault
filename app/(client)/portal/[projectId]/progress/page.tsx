import { createServiceRoleClient } from "@/utils/supabase/server";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

export default async function ClientProgressPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = createServiceRoleClient();

  const { data: photos } = await supabase
    .from("site_photos")
    .select("*, rooms(name)")
    .eq("project_id", projectId)
    .order("taken_at", { ascending: false })
    .order("created_at", { ascending: false });

  const photosWithUrls = await Promise.all((photos ?? []).map(async (p: any) => {
    const { data } = await supabase.storage.from("site-photos").createSignedUrl(p.file_path, 60 * 60 * 24);
    return { ...p, signedUrl: data?.signedUrl };
  }));

  const grouped: Record<string, typeof photosWithUrls> = {};
  for (const p of photosWithUrls) {
    if (!grouped[p.taken_at]) grouped[p.taken_at] = [];
    grouped[p.taken_at].push(p);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Site Progress</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{photosWithUrls.length} photo{photosWithUrls.length !== 1 ? "s" : ""}</p>
      </div>

      {photosWithUrls.length === 0 && (
        <div className="py-12 text-center border-2 border-dashed rounded-xl">
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No progress photos yet.</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, datePhotos]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {datePhotos.map((p: any) => (
              <div key={p.id} className="relative rounded-lg overflow-hidden border aspect-square bg-muted">
                {p.signedUrl && (
                  <Image src={p.signedUrl} alt={p.caption ?? "Progress"} fill className="object-cover" sizes="200px" />
                )}
                {(p.caption || p.rooms?.name) && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    {p.caption && <p className="text-xs text-white line-clamp-1">{p.caption}</p>}
                    {p.rooms?.name && <p className="text-xs text-white/70">{p.rooms.name}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
