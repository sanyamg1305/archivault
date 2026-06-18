import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { getSignoff } from "@/app/actions/signoff";
import Link from "next/link";
import {
  AlertCircle, CheckCircle2, ChevronRight, FileCheck,
  IndianRupee, CalendarDays, ClipboardList, Sparkles,
  MessageCircle, Clock, TrendingUp, Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ProgressRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
      <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke="currentColor" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="text-primary transition-all duration-700"
      />
    </svg>
  );
}

export default async function ClientDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await auth();
  const supabase = createServiceRoleClient();

  const [
    { data: project },
    { data: materials },
    { data: designs },
    { data: milestones },
    { data: activityLogs },
    { data: visits },
    { data: moodItems },
    signoff,
  ] = await Promise.all([
    supabase.from("projects").select("*, profiles(full_name)").eq("id", projectId).single(),
    supabase.from("materials").select("id, name, status, estimated_cost, rooms(name)").eq("project_id", projectId),
    supabase.from("designs").select("id, title, design_versions(id, status, version_number)").eq("project_id", projectId),
    supabase.from("project_milestones").select("id, title, completed_at, target_date").eq("project_id", projectId).order("sort_order"),
    supabase.from("activity_logs").select("id, action_description, created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(6),
    supabase.from("site_visits").select("id, title, visit_date, attendees").eq("project_id", projectId).order("visit_date", { ascending: false }).limit(3),
    supabase.from("mood_board_items").select("id").eq("project_id", projectId),
    getSignoff(projectId),
  ]);

  // Budget
  const totalBudget = Number(project?.total_budget ?? 0);
  const approvedSpend = (materials ?? []).filter(m => m.status === "Approved").reduce((s, m) => s + Number(m.estimated_cost), 0);
  const budgetPct = totalBudget > 0 ? Math.min(Math.round((approvedSpend / totalBudget) * 100), 100) : 0;

  // Pending approvals
  const pendingMaterials = (materials ?? []).filter(m => m.status === "Pending" || m.status === "Revision Requested");
  const pendingDesigns = (designs ?? []).flatMap(d =>
    (d.design_versions ?? []).filter((v: any) => v.status === "Pending" || v.status === "Revision Requested")
  );
  const totalPending = pendingMaterials.length + pendingDesigns.length;

  // Milestone progress
  const totalMilestones = milestones?.length ?? 0;
  const completedMilestones = (milestones ?? []).filter(m => m.completed_at).length;
  const milestonePct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Next pending milestone
  const nextMilestone = (milestones ?? []).find(m => !m.completed_at);

  // Next action for client
  const nextAction = totalPending > 0
    ? { label: `${totalPending} item${totalPending > 1 ? "s" : ""} awaiting your approval`, href: `/portal/${projectId}/action-center/design-approvals`, urgent: true }
    : signoff?.status === "pending"
    ? { label: "Formal sign-off requested by your architect", href: `/portal/${projectId}/signoff`, urgent: true }
    : nextMilestone
    ? { label: `Next milestone: ${nextMilestone.title}`, href: `/portal/${projectId}/timeline`, urgent: false }
    : null;

  const base = `/portal/${projectId}`;

  const quickLinks = [
    { label: "Action Center", href: `${base}/action-center/design-approvals`, icon: CheckCircle2, badge: totalPending > 0 ? totalPending : null },
    { label: "Timeline", href: `${base}/timeline`, icon: CalendarDays },
    { label: "Site Visits", href: `${base}/site-visits`, icon: ClipboardList, badge: visits?.length ?? null },
    { label: "Mood Board", href: `${base}/mood-board`, icon: Sparkles, badge: moodItems?.length ?? null },
    { label: "Sign-off", href: `${base}/signoff`, icon: FileCheck, badge: signoff?.status === "pending" ? "!" : signoff?.status === "signed" ? "✓" : null },
    { label: "Chat", href: `${base}/chat`, icon: MessageCircle },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">

      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your project overview — everything in one place.</p>
      </div>

      {/* Next action banner */}
      {nextAction && (
        <Link href={nextAction.href}>
          <div className={cn(
            "flex items-center justify-between rounded-xl p-4 border transition-all hover:shadow-sm",
            nextAction.urgent ? "bg-amber-50 border-amber-200" : "bg-primary/5 border-primary/20"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", nextAction.urgent ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary")}>
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next Action</p>
                <p className={cn("font-semibold text-sm mt-0.5", nextAction.urgent ? "text-amber-900" : "text-foreground")}>
                  {nextAction.label}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </Link>
      )}

      {/* Progress + budget row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Project progress ring */}
        <div className="sm:col-span-1 rounded-xl border bg-card p-5 flex items-center gap-5">
          <div className="relative shrink-0">
            <ProgressRing pct={milestonePct} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{milestonePct}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Project Progress</p>
            <p className="text-xs text-muted-foreground mt-0.5">{completedMilestones} of {totalMilestones} milestones</p>
            {nextMilestone && (
              <p className="text-xs text-primary mt-2 font-medium truncate max-w-[140px]">
                Next: {nextMilestone.title}
              </p>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="sm:col-span-2 rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Budget</p>
            <span className={cn("text-sm font-bold", budgetPct >= 90 ? "text-destructive" : budgetPct >= 75 ? "text-amber-500" : "text-primary")}>
              {budgetPct}% used
            </span>
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", budgetPct >= 90 ? "bg-destructive" : budgetPct >= 75 ? "bg-amber-500" : "bg-primary")}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">₹{approvedSpend.toLocaleString("en-IN")} approved</span>
            <span>of ₹{totalBudget.toLocaleString("en-IN")}</span>
          </div>
          <div className="pt-1 flex gap-4 text-xs">
            <span className="text-muted-foreground">
              Remaining: <span className="font-semibold text-foreground">₹{Math.max(totalBudget - approvedSpend, 0).toLocaleString("en-IN")}</span>
            </span>
            <span className="text-muted-foreground">
              Pending review: <span className="font-semibold text-amber-600">{pendingMaterials.length} items</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {quickLinks.map(({ label, href, icon: Icon, badge }) => (
          <Link key={label} href={href}>
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-all text-center relative">
              {badge !== null && badge !== undefined && (
                <span className={cn(
                  "absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                  badge === "✓" ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
                )}>
                  {badge}
                </span>
              )}
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <div className="rounded-xl border divide-y">
            {!activityLogs || activityLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No activity yet.</p>
            ) : activityLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm truncate">{log.action_description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(log.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent site visits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent Site Visits</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link href={`${base}/site-visits`}>View all</Link>
            </Button>
          </div>
          <div className="rounded-xl border divide-y">
            {!visits || visits.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No site visits yet.</p>
            ) : visits.map(v => (
              <div key={v.id} className="flex items-start gap-3 p-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                  <ClipboardList className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(v.visit_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {v.attendees?.length ? ` · ${v.attendees.length} attendee${v.attendees.length > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sign-off status (if exists) */}
      {signoff && (
        <Link href={`${base}/signoff`}>
          <div className={cn(
            "flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm",
            signoff.status === "signed" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
          )}>
            <div className="flex items-center gap-3">
              {signoff.status === "signed"
                ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                : <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              }
              <div>
                <p className="font-semibold text-sm">
                  {signoff.status === "signed" ? "Project signed off" : "Sign-off requested"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {signoff.status === "signed"
                    ? `Signed by ${signoff.signed_by_name} on ${new Date(signoff.signed_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Your architect is awaiting your formal acknowledgement"
                  }
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </Link>
      )}

    </div>
  );
}
