import { createServiceRoleClient } from "@/utils/supabase/server";
import { getProjectAccess } from "@/lib/project-access";
import { MaterialsTable } from "@/components/materials/materials-table";
import { AddMaterialDialog } from "@/components/materials/add-material-dialog";

export default async function RoomMaterialsPage({
  params,
}: {
  params: Promise<{ projectId: string; roomId: string }>;
}) {
  const { projectId, roomId } = await params;
  const access = await getProjectAccess(projectId);
  const canEdit = access?.canEdit ?? false;
  const supabase = createServiceRoleClient();

  const { data: rooms } = await supabase.from("rooms").select("*").eq("project_id", projectId);
  
  const { data: materials } = await supabase
    .from("materials")
    .select(`*, rooms(name)`)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Room Materials</h3>
        {canEdit && <AddMaterialDialog projectId={projectId} rooms={rooms || []} defaultRoomId={roomId} />}
      </div>
      <MaterialsTable 
        materials={materials || []} 
        projectId={projectId} 
        isAdminOrTeam={canEdit} 
      />
    </div>
  );
}
