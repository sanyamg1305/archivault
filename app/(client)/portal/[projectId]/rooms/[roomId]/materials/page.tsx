import { createServiceRoleClient } from "@/utils/supabase/server";
import { MaterialsTable } from "@/components/materials/materials-table";
import { AddMaterialDialog } from "@/components/materials/add-material-dialog";
import { auth } from "@clerk/nextjs/server";

export default async function ClientRoomMaterialsPage({
  params,
}: {
  params: Promise<{ projectId: string; roomId: string }>;
}) {
  const { projectId, roomId } = await params;
  const supabase = createServiceRoleClient();
  const { orgRole } = await auth();
  const isAdminOrTeam = orgRole === "org:admin" || orgRole === "org:member";

  const { data: rooms } = await supabase.from("rooms").select("id, name").eq("project_id", projectId);

  const { data: rawMaterials } = await supabase
    .from("materials")
    .select(`*, rooms(name)`)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  const materials = (rawMaterials ?? []).map((m) => ({
    ...m,
    imageUrl: m.image_path
      ? supabase.storage.from("materials").getPublicUrl(m.image_path).data.publicUrl
      : null,
  }));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Room Materials</h3>
        <AddMaterialDialog projectId={projectId} rooms={rooms || []} defaultRoomId={roomId} />
      </div>
      <MaterialsTable
        materials={materials}
        projectId={projectId}
        isAdminOrTeam={isAdminOrTeam}
      />
    </div>
  );
}
