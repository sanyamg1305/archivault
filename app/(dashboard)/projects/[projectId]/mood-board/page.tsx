import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { AddMoodBoardItemDialog } from "@/components/mood-board/add-item-dialog";
import { MoodBoardGrid } from "@/components/mood-board/mood-board-grid";
import { Sparkles } from "lucide-react";

export default async function MoodBoardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  await auth();
  const supabase = createServiceRoleClient();

  const [{ data: rooms }, { data: items }] = await Promise.all([
    supabase.from("rooms").select("id, name").eq("project_id", projectId).order("created_at"),
    supabase.from("mood_board_items").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
  ]);

  const allItems = items ?? [];

  // Generate signed URLs for image items
  const itemsWithUrls = await Promise.all(
    allItems.map(async (item) => {
      if (item.type === "image" && item.image_url) {
        const { data } = await supabase.storage.from("mood-board").createSignedUrl(item.image_url, 60 * 60 * 24);
        return { ...item, signedUrl: data?.signedUrl ?? null };
      }
      return { ...item, signedUrl: null };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Mood Board
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Client inspiration — images and reference links organised by room.
          </p>
        </div>
        <AddMoodBoardItemDialog projectId={projectId} rooms={rooms ?? []} />
      </div>

      <MoodBoardGrid
        items={itemsWithUrls as any}
        rooms={rooms ?? []}
        projectId={projectId}
        canDelete={true}
      />
    </div>
  );
}
