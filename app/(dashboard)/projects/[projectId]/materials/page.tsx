import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { AddMaterialDialog } from "@/components/materials/add-material-dialog";
import { MaterialsTable } from "@/components/materials/materials-table";

export default async function MaterialsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { orgRole } = await auth();
  const supabase = await createClerkSupabaseClient();

  const { data: rooms } = await supabase.from("rooms").select("*").eq("project_id", projectId);
  const { data: materials } = await supabase
    .from("materials")
    .select("*, rooms(name)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const isAdminOrTeam = orgRole === "org:admin" || orgRole === "org:member";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Material Selections</h2>
        {isAdminOrTeam && <AddMaterialDialog projectId={projectId} rooms={rooms || []} />}
      </div>
      <MaterialsTable 
        materials={materials || []} 
        projectId={projectId} 
        isAdminOrTeam={isAdminOrTeam} 
      />
    </div>
  );
}
