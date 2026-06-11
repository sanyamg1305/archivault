import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { ApprovalCardDesign } from "@/components/portal/action-center/approval-card-design";
import { PackageCheck } from "lucide-react";

export const metadata = {
  title: "Design Approvals | Action Center",
};

export default async function DesignApprovalsPage({
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

  const { data: pendingDesigns, error } = await supabase
    .from("design_versions")
    .select(`
      id, 
      file_path, 
      version_number, 
      change_notes,
      design:designs!inner (
        title,
        room:rooms(name)
      )
    `)
    .eq("status", "Pending")
    .eq("designs.project_id", projectId)
    .order("created_at", { ascending: false });

  const designs = pendingDesigns || [];

  const designsWithUrls = await Promise.all(
    designs.map(async (version: any) => {
      const { data } = await supabase.storage
        .from("designs")
        .createSignedUrl(version.file_path, 60 * 60 * 24);
        
      return {
        ...version,
        signedUrl: data?.signedUrl || null,
      };
    })
  );

  return (
    <div className="w-full">
      {designsWithUrls.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 py-24 bg-card border rounded-xl shadow-sm mt-4">
          <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-6">
            <PackageCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No pending designs!</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            You have reviewed all design versions. We will notify you when new designs are ready for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 pt-2">
          {designsWithUrls.map((version: any) => (
            <ApprovalCardDesign 
              key={version.id} 
              version={version} 
              design={{
                ...version.design,
                room: Array.isArray(version.design.room) ? version.design.room[0] : version.design.room
              }} 
              projectId={projectId} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
