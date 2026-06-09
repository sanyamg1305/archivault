import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { PrintButton } from "./print-button";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = await createClerkSupabaseClient();

  const [{ data: project }, { data: rooms }] = await Promise.all([
    supabase.from("projects").select("name, client_reference, total_budget").eq("id", projectId).single(),
    supabase
      .from("rooms")
      .select("id, name, materials(id, name, brand, vendor, category, estimated_cost, status)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
  ]);

  if (!project) redirect("/projects");

  const approvedTotal = (rooms ?? []).reduce((sum: number, room: any) => {
    const materials: any[] = Array.isArray(room.materials) ? room.materials : [];
    return sum + materials.filter((m) => m.status === "Approved").reduce((s: number, m: any) => s + Number(m.estimated_cost), 0);
  }, 0);

  const statusLabel: Record<string, string> = {
    Approved: "Approved",
    Pending: "Pending",
    Rejected: "Rejected",
    "Revision Requested": "Revision",
    Superseded: "Superseded",
  };

  return (
    <div className="min-h-screen bg-white p-10 font-sans text-zinc-900">
      {/* Print button — hidden when printing */}
      <div className="flex justify-end mb-8 print:hidden">
        <PrintButton />
      </div>

      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 mb-8">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Material Schedule</p>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex flex-wrap gap-6 mt-2 text-sm text-zinc-500">
          {project.client_reference && (
            <span>Client: <strong className="text-zinc-800">{project.client_reference}</strong></span>
          )}
          <span>Total Budget: <strong className="text-zinc-800">${Number(project.total_budget).toLocaleString()}</strong></span>
          <span>Approved Spend: <strong className="text-green-700">${approvedTotal.toLocaleString()}</strong></span>
          <span>Exported: <strong className="text-zinc-800">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong></span>
        </div>
      </div>

      {/* Rooms */}
      {(rooms ?? []).map((room: any) => {
        const materials: any[] = Array.isArray(room.materials) ? room.materials : [];
        if (materials.length === 0) return null;

        const roomApproved = materials
          .filter((m) => m.status === "Approved")
          .reduce((s: number, m: any) => s + Number(m.estimated_cost), 0);

        return (
          <div key={room.id} className="mb-10 break-inside-avoid">
            <div className="flex justify-between items-baseline mb-3">
              <h2 className="text-lg font-semibold">{room.name}</h2>
              <span className="text-sm text-zinc-500">
                Approved: <strong className="text-green-700">${roomApproved.toLocaleString()}</strong>
              </span>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-y border-zinc-200 text-left">
                  <th className="py-2 px-3 font-semibold text-zinc-600 w-1/3">Material</th>
                  <th className="py-2 px-3 font-semibold text-zinc-600">Brand</th>
                  <th className="py-2 px-3 font-semibold text-zinc-600">Vendor</th>
                  <th className="py-2 px-3 font-semibold text-zinc-600 text-right">Cost</th>
                  <th className="py-2 px-3 font-semibold text-zinc-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m: any) => (
                  <tr key={m.id} className="border-b border-zinc-100">
                    <td className="py-2 px-3">
                      <span className="font-medium">{m.name}</span>
                      {m.category && <span className="text-zinc-400 text-xs ml-2">({m.category})</span>}
                    </td>
                    <td className="py-2 px-3 text-zinc-600">{m.brand || "—"}</td>
                    <td className="py-2 px-3 text-zinc-600">{m.vendor || "—"}</td>
                    <td className="py-2 px-3 text-right font-mono">${Number(m.estimated_cost).toLocaleString()}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        m.status === "Approved" ? "bg-green-100 text-green-700" :
                        m.status === "Rejected" ? "bg-red-100 text-red-700" :
                        m.status === "Revision Requested" ? "bg-blue-100 text-blue-700" :
                        "bg-zinc-100 text-zinc-600"
                      }`}>
                        {statusLabel[m.status] ?? m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-zinc-200 text-xs text-zinc-400 flex justify-between">
        <span>Generated by ArchiVault</span>
        <span>{project.name} — Material Schedule</span>
      </div>
    </div>
  );
}
