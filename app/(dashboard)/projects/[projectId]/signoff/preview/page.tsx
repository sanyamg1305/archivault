import { createServiceRoleClient } from "@/utils/supabase/server";
import { getSignoff } from "@/app/actions/signoff";
import { CheckCircle2, FileCheck } from "lucide-react";

export default async function SignoffPreviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: project }, signoff, { data: materials }, { data: designVersions }] = await Promise.all([
    supabase.from("projects").select("name, client_reference, total_budget").eq("id", projectId).single(),
    getSignoff(projectId),
    supabase.from("materials").select("id, name, category, estimated_cost, rooms(name)").eq("project_id", projectId).eq("status", "Approved").order("category"),
    supabase.from("design_versions").select("id, version_number, designs!inner(title, project_id, rooms(name))").eq("designs.project_id", projectId).eq("status", "Approved"),
  ]);

  const totalApproved = (materials ?? []).reduce((s, m) => s + Number(m.estimated_cost), 0);

  const byCategory = (materials ?? []).reduce((acc, m) => {
    const cat = m.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {} as Record<string, typeof materials>);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Print button */}
      <div className="no-print fixed top-4 right-4 z-10">
        <button
          onClick={() => window.print()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:opacity-90"
        >
          Download / Print PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-12 space-y-10 text-zinc-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Project Sign-off Document</span>
            </div>
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            {project?.client_reference && (
              <p className="text-zinc-500 mt-1">{project.client_reference}</p>
            )}
          </div>
          <div className="text-right text-sm text-zinc-500 space-y-1">
            <p>Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            {signoff?.signed_at && (
              <p>Signed: {new Date(signoff.signed_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            )}
          </div>
        </div>

        {/* Sign-off status */}
        {signoff?.status === "signed" && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-5">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Formally signed off by {signoff.signed_by_name}</p>
              <p className="text-sm text-green-700 mt-0.5">
                {new Date(signoff.signed_at!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )}

        {signoff?.notes && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-2">Architect Notes</h2>
            <p className="text-zinc-700 leading-relaxed">{signoff.notes}</p>
          </div>
        )}

        {/* Approved Materials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Approved Materials</h2>
            <span className="text-sm text-zinc-500">{materials?.length ?? 0} items · ₹{totalApproved.toLocaleString("en-IN")}</span>
          </div>
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{category}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-zinc-500">
                    <th className="pb-2 font-medium">Material</th>
                    <th className="pb-2 font-medium">Room</th>
                    <th className="pb-2 font-medium text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(items ?? []).map((m: any) => (
                    <tr key={m.id}>
                      <td className="py-2">{m.name}</td>
                      <td className="py-2 text-zinc-500">{m.rooms?.name ?? "—"}</td>
                      <td className="py-2 text-right">₹{Number(m.estimated_cost).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total Approved Spend</span>
            <span>₹{totalApproved.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Approved Designs */}
        {designVersions && designVersions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Approved Designs</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-2 font-medium">Design</th>
                  <th className="pb-2 font-medium">Version</th>
                  <th className="pb-2 font-medium">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {designVersions.map((dv: any) => (
                  <tr key={dv.id}>
                    <td className="py-2">{dv.designs?.title}</td>
                    <td className="py-2 text-zinc-500">v{dv.version_number}</td>
                    <td className="py-2 text-zinc-500">{dv.designs?.rooms?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature block */}
        <div className="border-t pt-10 grid grid-cols-2 gap-12">
          <div>
            <div className="h-12 border-b border-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">Architect / Designer</p>
            <p className="text-sm font-medium mt-0.5">{signoff?.requested_by_name ?? "—"}</p>
          </div>
          <div>
            <div className="h-12 border-b border-zinc-400 mb-2 relative">
              {signoff?.status === "signed" && (
                <p className="absolute bottom-2 left-0 text-base font-medium italic text-zinc-700">
                  {signoff.signed_by_name}
                </p>
              )}
            </div>
            <p className="text-sm text-zinc-500">Client Acknowledgement</p>
            {signoff?.signed_by_name && <p className="text-sm font-medium mt-0.5">{signoff.signed_by_name}</p>}
          </div>
        </div>

        <p className="text-xs text-center text-zinc-400 border-t pt-6">
          This document was generated by ArchiVault · {project?.name} · {new Date().toLocaleDateString("en-IN")}
        </p>
      </div>
    </>
  );
}
