import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { MaterialsTable } from "@/components/materials/materials-table";
import { auth } from "@clerk/nextjs/server";

export default async function ClientRoomMaterialsPage({
  params,
}: {
  params: Promise<{ projectId: string; roomId: string }>;
}) {
  const { projectId, roomId } = await params;
  const supabase = await createClerkSupabaseClient();
  const { orgRole } = await auth();
  const isAdminOrTeam = orgRole === "org:admin" || orgRole === "org:member";

  const { data: materials } = await supabase
    .from("materials")
    .select(`*, rooms(name)`)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Room Materials</h3>
      </div>
      <MaterialsTable 
        materials={materials || []} 
        projectId={projectId} 
        isAdminOrTeam={isAdminOrTeam} 
      />
    </div>
  );
}
