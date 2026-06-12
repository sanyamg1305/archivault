import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { AddMilestoneDialog } from "@/components/timeline/add-milestone-dialog";
import { MilestoneItem } from "@/components/timeline/milestone-item";
import { CalendarDays } from "lucide-react";

export default async function TimelinePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { orgId } = await auth();
  if (!orgId) return null;

  const supabase = createServiceRoleClient();
  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", projectId)
    .eq("organization_id", orgId)
    .order("sort_order")
    .order("target_date", { ascending: true, nullsFirst: false });

  const done = milestones?.filter(m => m.completed_at).length ?? 0;
  const total = milestones?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Timeline</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{done}/{total} milestones completed</p>
        </div>
        <AddMilestoneDialog projectId={projectId} nextOrder={total} />
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No milestones yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add phases like Design, Permit, Execution, Handover.</p>
        </div>
      )}

      {total > 0 && (
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-2">
            {milestones!.map((m, i) => (
              <MilestoneItem key={m.id} milestone={m} projectId={projectId} isLast={i === total - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
