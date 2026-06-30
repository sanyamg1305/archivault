import { createServiceRoleClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { AddMaterialDialog } from "@/components/materials/add-material-dialog";
import { MaterialsTable } from "@/components/materials/materials-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Printer } from "lucide-react";

export default async function MaterialsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { orgRole } = await auth();
  const supabase = createServiceRoleClient();

  const [{ data: rooms }, { data: rawMaterials }] = await Promise.all([
    supabase.from("rooms").select("id, name").eq("project_id", projectId),
    supabase
      .from("materials")
      .select("*, rooms(name)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  ]);

  // Signed URLs — materials bucket is private
  const imagePaths = (rawMaterials ?? []).map((m) => m.image_path).filter(Boolean);
  const { data: signedResults } = imagePaths.length
    ? await supabase.storage.from("materials").createSignedUrls(imagePaths, 60 * 60 * 24)
    : { data: [] };
  const imageUrlMap = Object.fromEntries(
    (signedResults ?? []).map((r: any) => [r.path, r.signedUrl])
  );
  const materials = (rawMaterials ?? []).map((m) => ({
    ...m,
    imageUrl: m.image_path ? (imageUrlMap[m.image_path] ?? null) : null,
  }));

  const isAdminOrTeam = orgRole === "org:admin" || orgRole === "org:member";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Material Selections</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/print/${projectId}`} target="_blank">
              <Printer className="h-4 w-4 mr-2" />
              Export PDF
            </Link>
          </Button>
          {isAdminOrTeam && <AddMaterialDialog projectId={projectId} rooms={rooms || []} />}
        </div>
      </div>
      <MaterialsTable 
        materials={materials || []} 
        projectId={projectId} 
        isAdminOrTeam={isAdminOrTeam} 
      />
    </div>
  );
}
