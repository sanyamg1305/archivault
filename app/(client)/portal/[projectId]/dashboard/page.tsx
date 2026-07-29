import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { getSignoff } from "@/app/actions/signoff";
import Link from "next/link";
import {
  AlertCircle, CheckCircle2, ChevronRight, FileCheck,
  IndianRupee, CalendarDays, ClipboardList, Sparkles,
  MessageCircle, Clock, TrendingUp, Calendar, Info
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
      <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke="currentColor" strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="text-[#2F5BFF] transition-all duration-700"
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
  const user = await currentUser();
  const firstName = user?.firstName || "Client";

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
    <div className="p-8 space-y-10 animate-in fade-in duration-300 relative min-h-screen">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-[#2F5BFF]/5 to-[#6366f1]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Client Header Card (Redesigned with glowing premium look) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f10] p-8 text-white shadow-xl min-h-[160px] flex flex-col justify-between">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-[#2F5BFF]/20 text-[#93c5fd] border border-[#2F5BFF]/30">
            Client Portal Workspace
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-white">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-white/70 leading-relaxed font-medium">
            Track your project's development phases, inspect mood boards, view timeline status, and coordinate design approvals with your architect.
          </p>
        </div>
        {/* Abstract background graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#2F5BFF]/10 to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#2F5BFF]/20 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* Progress + Budget Row (Eduplex Mockup top metrics style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project progress ring card */}
        <div className="border border-border/60 rounded-2xl p-6 bg-card/45 backdrop-blur-md shadow-sm flex items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-20 h-20 bg-[#2F5BFF]/5 rounded-full blur-xl pointer-events-none" />
          <div className="relative shrink-0 flex items-center justify-center">
            <ProgressRing pct={milestonePct} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">{milestonePct}%</span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-foreground">Project Progress</p>
            <p className="text-xs text-muted-foreground mt-1">{completedMilestones} of {totalMilestones} milestones</p>
            {nextMilestone && (
              <p className="text-xs text-[#2F5BFF] mt-3 font-semibold truncate max-w-[140px]" title={nextMilestone.title}>
                Next: {nextMilestone.title}
              </p>
            )}
          </div>
        </div>

        {/* Dark budget utilization card (Go Premium banner style) */}
        <div className="md:col-span-2 bg-[#0f0f10] border border-border/40 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/10 text-white/90">
                Budget Tracking
              </span>
              <h3 className="text-base font-bold mt-1.5">Approved Project Expenses</h3>
            </div>
            <span className={cn("text-xs font-bold px-2 py-1 rounded bg-white/10", budgetPct >= 90 ? "text-red-400" : budgetPct >= 75 ? "text-amber-400" : "text-white")}>
              {budgetPct}% Used
            </span>
          </div>

          <div className="space-y-2 mt-4 relative z-10">
            <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#2F5BFF] to-indigo-400")}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span className="font-semibold text-white">₹{approvedSpend.toLocaleString("en-IN")} Approved</span>
              <span>of ₹{totalBudget.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex gap-4 text-[10px] text-white/60 relative z-10 mt-3">
            <span>
              Remaining: <span className="font-semibold text-white">₹{Math.max(totalBudget - approvedSpend, 0).toLocaleString("en-IN")}</span>
            </span>
            <span>
              Pending approvals: <span className="font-semibold text-amber-400">{pendingMaterials.length} items</span>
            </span>
          </div>
          
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#2F5BFF]/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Quick Links Grid (Eduplex Sidebar shortcut style) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground">Project Sections</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {quickLinks.map(({ label, href, icon: Icon, badge }) => (
            <Link key={label} href={href} className="group">
              <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-border/50 bg-card/45 backdrop-blur-md p-4 hover:border-[#2F5BFF]/50 hover:bg-[#eaefff]/30 transition-all text-center relative hover:-translate-y-0.5 duration-300">
                {badge !== null && badge !== undefined && (
                  <span className={cn(
                    "absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center",
                    badge === "✓" ? "bg-green-500 text-white" : "bg-[#2F5BFF] text-white"
                  )}>
                    {badge}
                  </span>
                )}
                <Icon className="h-5 w-5 text-[#2F5BFF] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs font-semibold text-foreground group-hover:text-[#2F5BFF] transition-colors leading-tight">
                  {label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Split details column (Next Action, Recent Activity, Site Visits) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3 Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Next action banner */}
          {nextAction && (
            <Link href={nextAction.href} className="block">
              <div className={cn(
                "flex items-center justify-between rounded-2xl p-4 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                nextAction.urgent ? "bg-amber-500/5 border-amber-500/20" : "bg-[#2F5BFF]/5 border-[#2F5BFF]/20"
              )}>
                <div className="flex items-center gap-3.5">
                  <div className={cn("p-2 rounded-xl", nextAction.urgent ? "bg-amber-500/10 text-amber-600" : "bg-[#2F5BFF]/10 text-[#2F5BFF]")}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Pending Action</p>
                    <p className="font-semibold text-sm mt-0.5 text-foreground">
                      {nextAction.label}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/60 shrink-0" />
              </div>
            </Link>
          )}

          {/* Activity vertical timeline */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">Project Activity Timeline</h3>
            <div className="rounded-2xl border border-border/50 divide-y divide-border/30 bg-card/45 backdrop-blur-md overflow-hidden">
              {!activityLogs || activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6 text-center">No activity updates yet.</p>
              ) : activityLogs.map(log => (
                <div key={log.id} className="flex items-start gap-4.5 p-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#2F5BFF] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground leading-snug">{log.action_description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1/3 Widget Area */}
        <div className="space-y-8">
          {/* Recent Site Visits Schedule widget */}
          <div className="border border-border/60 rounded-2xl p-6 bg-card/45 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2F5BFF]" />
                Recent Site Visits
              </h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-[#2F5BFF] hover:bg-[#eaefff]" asChild>
                <Link href={`${base}/site-visits`}>View all</Link>
              </Button>
            </div>
            
            <div className="space-y-3">
              {!visits || visits.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No site visits logged.</p>
              ) : visits.map(v => (
                <div key={v.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/10 border border-border/30">
                  <div className="p-2 rounded-lg bg-[#2F5BFF]/10 text-[#2F5BFF] shrink-0">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{v.title}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      {new Date(v.visit_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off overview */}
          {signoff && (
            <Link href={`${base}/signoff`} className="block">
              <div className={cn(
                "flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                signoff.status === "signed" ? "bg-green-500/5 border-green-500/20" : "bg-amber-500/5 border-amber-500/20"
              )}>
                <div className="flex items-center gap-3.5">
                  {signoff.status === "signed"
                    ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    : <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                  }
                  <div>
                    <p className="font-semibold text-xs text-foreground">
                      {signoff.status === "signed" ? "Project signed off" : "Sign-off requested"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5 leading-relaxed">
                      {signoff.status === "signed"
                        ? `Signed by ${signoff.signed_by_name} on ${new Date(signoff.signed_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                        : "Acknowledgement requested by your architect"
                      }
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
