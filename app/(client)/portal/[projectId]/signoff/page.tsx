import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { getSignoff } from "@/app/actions/signoff";
import { ClientSignoffPanel } from "@/components/signoff/client-signoff-panel";
import { CheckCircle2, FileCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ClientSignoffPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  await auth();
  const supabase = createServiceRoleClient();

  const [{ data: project }, signoff, { data: materials }, { data: designVersions }] = await Promise.all([
    supabase.from("projects").select("name, client_reference").eq("id", projectId).single(),
    getSignoff(projectId),
    supabase.from("materials").select("id, name, category, estimated_cost, rooms(name)").eq("project_id", projectId).eq("status", "Approved").order("category"),
    supabase.from("design_versions").select("id, version_number, designs!inner(title, project_id, rooms(name))").eq("designs.project_id", projectId).eq("status", "Approved"),
  ]);

  const totalApproved = (materials ?? []).reduce((s, m) => s + Number(m.estimated_cost), 0);

  if (!signoff) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Clock className="h-10 w-10 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">No sign-off requested yet</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Your architect will send a sign-off request once all items are finalised.
        </p>
      </div>
    );
  }

  if (signoff.status === "signed") {
    return (
      <div className="p-6 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-6">
          <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-900 text-lg">You have signed off this project</p>
            <p className="text-sm text-green-700 mt-0.5">
              Signed by {signoff.signed_by_name} on {new Date(signoff.signed_at!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/print/${projectId}`} target="_blank">
            <FileCheck className="h-4 w-4" /> View Sign-off Document
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" /> Project Sign-off
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{project?.name}</p>
      </div>

      {signoff.notes && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Note from your architect</p>
          <p className="text-sm">{signoff.notes}</p>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-xl border divide-y">
        <div className="p-4">
          <h3 className="font-semibold mb-3">Approved Materials ({materials?.length ?? 0})</h3>
          <div className="space-y-2">
            {(materials ?? []).map((m: any) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span>{m.name} <span className="text-muted-foreground">· {m.rooms?.name ?? "General"}</span></span>
                <span className="font-medium">₹{Number(m.estimated_cost).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span>₹{totalApproved.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {designVersions && designVersions.length > 0 && (
          <div className="p-4">
            <h3 className="font-semibold mb-3">Approved Designs ({designVersions.length})</h3>
            <div className="space-y-2">
              {designVersions.map((dv: any) => (
                <div key={dv.id} className="text-sm">
                  {dv.designs?.title} <span className="text-muted-foreground">v{dv.version_number} · {dv.designs?.rooms?.name ?? "General"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ClientSignoffPanel projectId={projectId} />
    </div>
  );
}
