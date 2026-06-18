import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { getSignoff } from "@/app/actions/signoff";
import { RequestSignoffPanel } from "@/components/signoff/request-signoff-panel";
import { CheckCircle2, Clock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SignoffPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServiceRoleClient();
  const [{ data: project }, signoff, { data: approvedMaterials }, { data: approvedDesigns }] = await Promise.all([
    supabase.from("projects").select("name, client_reference").eq("id", projectId).single(),
    getSignoff(projectId),
    supabase.from("materials").select("id, name, category, estimated_cost, rooms(name)").eq("project_id", projectId).eq("status", "Approved"),
    supabase.from("design_versions").select("id, version_number, designs!inner(title, project_id)").eq("designs.project_id", projectId).eq("status", "Approved"),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" /> Project Sign-off
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Request a formal client acknowledgement of all approved items.
        </p>
      </div>

      {signoff?.status === "signed" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Signed off</p>
              <p className="text-sm text-green-700">
                {signoff.signed_by_name} · {new Date(signoff.signed_at!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/projects/${projectId}/signoff/preview`} target="_blank">
              <FileCheck className="h-4 w-4" /> View / Download PDF
            </Link>
          </Button>
        </div>
      ) : signoff?.status === "pending" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">Awaiting client sign-off</p>
              <p className="text-sm text-amber-700">
                Requested by {signoff.requested_by_name} on {new Date(signoff.requested_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          {signoff.notes && (
            <div className="rounded-lg bg-amber-100/60 p-3 text-sm text-amber-800">{signoff.notes}</div>
          )}
        </div>
      ) : (
        <RequestSignoffPanel
          projectId={projectId}
          approvedMaterialCount={approvedMaterials?.length ?? 0}
          approvedDesignCount={approvedDesigns?.length ?? 0}
        />
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-2xl font-semibold">{approvedMaterials?.length ?? 0}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Approved materials</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-2xl font-semibold">{approvedDesigns?.length ?? 0}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Approved designs</p>
        </div>
      </div>
    </div>
  );
}
