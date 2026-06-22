import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, FolderOpen, ArrowRight, AlertCircle } from "lucide-react";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { CopyLinkButton } from "@/components/projects/copy-link-button";

export const metadata = {
  title: "Projects Directory — ArchiVault",
  description: "View and filter all your architecture projects.",
};

const STATUS_OPTIONS = ["All", "Active", "On Hold", "Completed"];

export default async function ProjectsDirectoryPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { orgId, orgRole } = await auth();
  const supabase = createServiceRoleClient();

  const params = await searchParams;
  const searchQuery = typeof params.q === 'string' ? params.q.toLowerCase() : '';
  const statusFilter = typeof params.status === 'string' ? params.status : 'All';

  const isAdmin = orgRole === "org:admin";

  const [{ data: projects }, { data: milestones }] = await Promise.all([
    supabase.from("projects").select("*").eq("organization_id", orgId ?? "").order("created_at", { ascending: false }),
    supabase.from("project_milestones").select("project_id, completed_at, target_date").eq("organization_id", orgId ?? ""),
  ]);

  // Build overdue set: projects with any milestone past target_date and not completed
  const today = new Date().toISOString().slice(0, 10);
  const overdueProjects = new Set<string>();
  for (const m of milestones ?? []) {
    if (!m.completed_at && m.target_date && m.target_date < today) {
      overdueProjects.add(m.project_id);
    }
  }

  const filteredProjects = (projects ?? []).filter(p => {
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      (p.client_reference && p.client_reference.toLowerCase().includes(searchQuery));
    const matchesStatus = statusFilter === 'All' || (p.status ?? 'Active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects Directory</h1>
          <p className="text-muted-foreground mt-2">
            Overview of all your architectural and design projects.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <form className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder="Search projects..."
              className="pl-9 bg-background h-10 border-muted"
              defaultValue={searchQuery}
            />
          </form>
          {/* Status filter — URL-driven via GET links */}
          <div className="flex gap-1">
            {STATUS_OPTIONS.map(s => (
              <Link
                key={s}
                href={`/projects?${new URLSearchParams({ ...(searchQuery ? { q: searchQuery } : {}), ...(s !== 'All' ? { status: s } : {}) }).toString()}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  (s === 'All' && statusFilter === 'All') || statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
          {isAdmin && <CreateProjectDialog />}
        </div>
      </div>

      {/* Bento-style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const isOverdue = overdueProjects.has(project.id);
            return (
              <div key={project.id} className="relative group/wrap">
                {/* Action buttons on hover */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover/wrap:opacity-100 transition-opacity">
                  <CopyLinkButton projectId={project.id} />
                  {isAdmin && <DeleteProjectButton projectId={project.id} projectName={project.name} />}
                </div>
                <Link href={`/projects/${project.id}`} className="group block focus:outline-none">
                  <Card className="h-full border-muted bg-card/40 hover:bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative flex flex-col">
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isOverdue && (
                            <span title="Has overdue milestones">
                              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                            project.status === "Completed" ? "text-blue-700 bg-blue-100" :
                            project.status === "On Hold" ? "text-amber-700 bg-amber-100" :
                            "text-green-700 bg-green-100"
                          }`}>
                            {project.status ?? "Active"}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 mt-1 font-medium">
                        {project.client_reference || 'No client reference'}
                      </CardDescription>
                      {project.project_type && (
                        <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {project.project_type}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto pt-2">
                      <div className="space-y-4">
                        <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Budget</p>
                          <p className="text-lg font-bold tracking-tight text-foreground">
                            ₹{Number(project.total_budget).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="pt-2 flex items-center text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                          View project <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-xl border-muted bg-muted/10">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No projects found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? "No projects match your filters. Try adjusting them."
                : isAdmin
                  ? "You haven't created any projects yet."
                  : "No projects have been assigned to you."}
            </p>
            {isAdmin && !searchQuery && statusFilter === 'All' && <CreateProjectDialog />}
          </div>
        )}
      </div>
    </div>
  );
}
