import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { ApprovalCardMaterial } from "@/components/portal/action-center/approval-card-material";
import { PackageCheck } from "lucide-react";

export const metadata = {
  title: "Material Approvals | Action Center",
};

export default async function MaterialApprovalsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId, orgId } = await auth();
  if (!userId || !orgId) redirect("/sign-in");

  const supabase = createServiceRoleClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (!project) redirect("/portal");

  const { data: materialsResult } = await supabase
    .from("materials")
    .select("id, name, brand, category, estimated_cost, image_path, room:rooms(name)")
    .eq("project_id", projectId)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });

  const pendingMaterials = (materialsResult ?? []).map((m: any) => ({
    ...m,
    imageUrl: m.image_path
      ? supabase.storage.from("materials").getPublicUrl(m.image_path).data.publicUrl
      : null,
  }));

  return (
    <div className="w-full">
      {pendingMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 py-24 bg-card border rounded-xl shadow-sm mt-4">
          <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6">
            <PackageCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No pending materials!</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            All materials have been reviewed. We will notify you when new materials require your approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pt-2">
          {pendingMaterials.map((material: any) => (
            <ApprovalCardMaterial 
              key={material.id} 
              material={{
                ...material,
                room: Array.isArray(material.room) ? material.room[0] : material.room
              }} 
              projectId={projectId} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
