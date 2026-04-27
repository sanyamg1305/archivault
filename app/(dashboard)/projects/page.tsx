import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
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
import { Search, FolderOpen, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Projects Directory — ArchiVault",
  description: "View and filter all your architecture projects.",
};

export default async function ProjectsDirectoryPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { orgId, userId } = await auth();
  const supabase = await createClerkSupabaseClient();
  
  const params = await searchParams;
  const searchQuery = typeof params.q === 'string' ? params.q.toLowerCase() : '';

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: projects } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  
  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery) || 
    (p.client_reference && p.client_reference.toLowerCase().includes(searchQuery))
  ) || [];

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
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Simple search form that updates URL ?q= */}
          <form className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              name="q" 
              type="search" 
              placeholder="Search projects by name..." 
              className="pl-9 bg-background h-10 border-muted"
              defaultValue={searchQuery}
            />
          </form>
          {isAdmin && <CreateProjectDialog />}
        </div>
      </div>

      {/* Bento-style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, i) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="group block focus:outline-none">
              <Card className="h-full border-muted bg-card/40 hover:bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative flex flex-col">
                {/* Accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    {/* Placeholder status since DB migration comes later */}
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-sm uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 mt-1 font-medium">
                    {project.client_reference || 'No client reference'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-2">
                  <div className="space-y-4">
                    <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Budget</p>
                      <p className="text-lg font-bold tracking-tight text-foreground">
                        ${Number(project.total_budget).toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                      View project <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-xl border-muted bg-muted/10">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No projects found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
              {searchQuery 
                ? "No projects match your search query. Try taking out some keywords."
                : isAdmin
                  ? "You haven't created any projects yet."
                  : "No projects have been assigned to you."}
            </p>
            {isAdmin && !searchQuery && <CreateProjectDialog />}
          </div>
        )}
      </div>
    </div>
  );
}
