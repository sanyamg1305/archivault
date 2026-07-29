import { createServiceRoleClient } from "@/utils/supabase/server";
import { getProjectAccess } from "@/lib/project-access";
import { AddMoodBoardItemDialog } from "@/components/mood-board/add-item-dialog";
import { MoodBoardGrid } from "@/components/mood-board/mood-board-grid";
import { Sparkles } from "lucide-react";

export default async function MoodBoardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  const canEdit = access?.canEdit ?? false;
  const supabase = createServiceRoleClient();

  const [{ data: rooms }, { data: items }] = await Promise.all([
    supabase.from("rooms").select("id, name").eq("project_id", projectId).order("created_at"),
    supabase.from("mood_board_items").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
  ]);

  const allItems = items ?? [];

  // Batch signed URLs for image items
  const imagePaths = allItems.filter((item) => item.type === "image" && item.image_url).map((item) => item.image_url);
  const { data: signedResults } = imagePaths.length
    ? await supabase.storage.from("mood-board").createSignedUrls(imagePaths, 60 * 60 * 24)
    : { data: [] };
  const urlMap = Object.fromEntries((signedResults ?? []).map((r: any) => [r.path, r.signedUrl]));

  const itemsWithUrls = allItems.map((item) => ({
    ...item,
    signedUrl: item.type === "image" && item.image_url ? (urlMap[item.image_url] ?? null) : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Mood Board
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Client inspiration - images and reference links organised by room.
          </p>
        </div>
        {canEdit && <AddMoodBoardItemDialog projectId={projectId} rooms={rooms ?? []} />}
      </div>

      <MoodBoardGrid
        items={itemsWithUrls as any}
        rooms={rooms ?? []}
        projectId={projectId}
        canDelete={canEdit}
      />
    </div>
  );
}
