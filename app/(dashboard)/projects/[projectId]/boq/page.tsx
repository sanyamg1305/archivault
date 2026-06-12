import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { PrintButton } from "@/app/(dashboard)/projects/[projectId]/export/print-button";

export default async function BOQPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { orgId } = await auth();
  if (!orgId) return null;

  const supabase = createServiceRoleClient();

  const [{ data: project }, { data: rooms }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).single(),
    supabase.from("rooms").select("*, materials(*, vendors(name))").eq("project_id", projectId).order("name"),
  ]);

  const grandTotal = (rooms ?? []).reduce((sum: number, room: any) => {
    const roomTotal = (room.materials ?? [])
      .filter((m: any) => m.status !== "Rejected")
      .reduce((s: number, m: any) => s + (Number(m.estimated_cost) || 0), 0);
    return sum + roomTotal;
  }, 0);

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 no-print">
          <div>
            <h2 className="text-xl font-semibold">Bill of Quantities</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Room-wise material cost breakdown</p>
          </div>
          <PrintButton />
        </div>

        {/* Print header */}
        <div className="mb-8 print:block">
          <h1 className="text-2xl font-bold">{project?.name}</h1>
          <p className="text-sm text-muted-foreground">Bill of Quantities — Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          {project?.client_reference && <p className="text-sm text-muted-foreground">Client: {project.client_reference}</p>}
        </div>

        {/* BOQ table per room */}
        {(rooms ?? []).map((room: any) => {
          const materials = (room.materials ?? []).filter((m: any) => m.status !== "Rejected");
          if (!materials.length) return null;
          const roomTotal = materials.reduce((s: number, m: any) => s + (Number(m.estimated_cost) || 0), 0);

          return (
            <div key={room.id} className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base">{room.name}</h3>
                <span className="text-sm font-medium text-muted-foreground">
                  ₹{roomTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium">Material</th>
                    <th className="text-left px-3 py-2 font-medium">Vendor</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-right px-3 py-2 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m: any) => (
                    <tr key={m.id} className="border-b hover:bg-muted/20">
                      <td className="px-3 py-2">{m.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m.vendors?.name ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          m.status === "Approved" ? "bg-green-100 text-green-700" :
                          m.status === "Revision Requested" ? "bg-red-100 text-red-700" :
                          "bg-zinc-100 text-zinc-600"
                        }`}>{m.status}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        ₹{Number(m.estimated_cost || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Grand total */}
        <div className="border-t-2 pt-4 flex items-center justify-between">
          <span className="font-bold text-lg">Grand Total</span>
          <span className="font-bold text-xl">₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </>
  );
}
