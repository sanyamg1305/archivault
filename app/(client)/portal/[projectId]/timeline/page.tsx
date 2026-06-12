import { createServiceRoleClient } from "@/utils/supabase/server";
import { CheckCircle2, Circle, CalendarDays } from "lucide-react";

export default async function ClientTimelinePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = createServiceRoleClient();

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order")
    .order("target_date", { ascending: true, nullsFirst: false });

  const total = milestones?.length ?? 0;
  const done = milestones?.filter(m => m.completed_at).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Project Timeline</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{done} of {total} milestones completed</p>
        {total > 0 && (
          <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${total > 0 ? Math.round((done / total) * 100) : 0}%` }} />
          </div>
        )}
      </div>

      {total === 0 && (
        <div className="py-12 text-center border-2 border-dashed rounded-xl">
          <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No timeline set yet.</p>
        </div>
      )}

      {total > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-2">
            {milestones!.map((m: any) => {
              const isDone = !!m.completed_at;
              return (
                <div key={m.id} className="relative pl-10 pb-2">
                  <div className={`absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 ${isDone ? "border-primary" : "border-border"}`}>
                    {isDone
                      ? <CheckCircle2 className="h-4 w-4 text-primary" />
                      : <Circle className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className={`rounded-lg border p-4 ${isDone ? "bg-muted/30 border-muted" : "bg-card"}`}>
                    <p className={`font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>{m.title}</p>
                    {m.description && <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>}
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {m.target_date && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          Target: {new Date(m.target_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {m.completed_at && (
                        <span className="text-primary font-medium">
                          ✓ Completed {new Date(m.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
