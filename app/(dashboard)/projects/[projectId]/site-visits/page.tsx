import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { LogVisitDialog } from "@/components/site-visits/log-visit-dialog";
import { VisitCard } from "@/components/site-visits/visit-card";
import { ClipboardList } from "lucide-react";

export default async function SiteVisitsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  await auth();
  const supabase = createServiceRoleClient();

  const { data: visits } = await supabase
    .from("site_visits")
    .select("*")
    .eq("project_id", projectId)
    .order("visit_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Site Visit Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Structured records of every site visit — part of the project audit trail.
          </p>
        </div>
        <LogVisitDialog projectId={projectId} />
      </div>

      {!visits || visits.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-xl">
          <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No site visits logged yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Log a visit to start building the site audit trail.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map(v => (
            <VisitCard key={v.id} visit={v} projectId={projectId} canEdit={true} />
          ))}
        </div>
      )}
    </div>
  );
}
