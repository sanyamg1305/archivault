import { createServiceRoleClient } from "@/utils/supabase/server";
import { VisitCard } from "@/components/site-visits/visit-card";
import { ClipboardList } from "lucide-react";

export default async function ClientSiteVisitsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = createServiceRoleClient();

  const { data: visits } = await supabase
    .from("site_visits")
    .select("*")
    .eq("project_id", projectId)
    .order("visit_date", { ascending: false });

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" /> Site Visit Log
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          A record of every site visit by your architect.
        </p>
      </div>

      {!visits || visits.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-xl">
          <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No site visits recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map(v => (
            <VisitCard key={v.id} visit={v} projectId={projectId} canEdit={false} />
          ))}
        </div>
      )}
    </div>
  );
}
