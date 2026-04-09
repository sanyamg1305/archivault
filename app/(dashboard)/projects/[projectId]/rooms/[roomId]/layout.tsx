import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { RoomNav } from "@/components/rooms/room-nav";

export default async function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string; roomId: string }>;
}) {
  const { projectId, roomId } = await params;
  const supabase = await createClerkSupabaseClient();

  const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).single();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href={`/projects/${projectId}/rooms`}
          className="p-2 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{room?.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Room Details, Designs & Materials
          </p>
        </div>
      </div>

      <RoomNav projectId={projectId} roomId={roomId} />

      {children}
    </div>
  );
}
