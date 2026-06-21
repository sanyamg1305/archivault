import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Search, FolderKanban, Package, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { orgId } = await auth();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = createServiceRoleClient();

  let projects: any[] = [];
  let materials: any[] = [];
  let designs: any[] = [];

  if (query.length >= 2) {
    const pattern = `%${query}%`;

    const [{ data: p }, { data: m }, { data: d }] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, client_reference, status")
        .eq("organization_id", orgId ?? "")
        .or(`name.ilike.${pattern},client_reference.ilike.${pattern}`)
        .limit(10),
      supabase
        .from("materials")
        .select("id, name, category, status, project_id, projects(name)")
        .eq("projects.organization_id", orgId ?? "")
        .ilike("name", pattern)
        .limit(10),
      supabase
        .from("designs")
        .select("id, title, project_id, projects(name)")
        .eq("projects.organization_id", orgId ?? "")
        .ilike("title", pattern)
        .limit(10),
    ]);

    projects = p ?? [];
    materials = m ?? [];
    designs = d ?? [];
  }

  const total = projects.length + materials.length + designs.length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">Search across projects, materials, and designs.</p>
      </div>

      <form method="get">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search projects, materials, designs…"
            autoFocus
            className="pl-9 h-11 text-base"
          />
        </div>
      </form>

      {query.length >= 2 && (
        <p className="text-sm text-muted-foreground">
          {total === 0 ? `No results for "${query}"` : `${total} result${total !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {query.length >= 2 && total > 0 && (
        <div className="space-y-8">
          {projects.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FolderKanban className="h-3.5 w-3.5" /> Projects
              </h2>
              <div className="divide-y rounded-xl border">
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      {p.client_reference && <p className="text-xs text-muted-foreground">{p.client_reference}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "Completed" ? "bg-blue-100 text-blue-700" :
                      p.status === "On Hold" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>{p.status ?? "Active"}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {materials.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Materials
              </h2>
              <div className="divide-y rounded-xl border">
                {materials.map((m: any) => (
                  <Link key={m.id} href={`/projects/${m.project_id}/materials`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.category} · {m.projects?.name}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      m.status === "Approved" ? "bg-green-100 text-green-700" :
                      m.status === "Rejected" ? "bg-red-100 text-red-700" :
                      m.status === "Revision Requested" ? "bg-amber-100 text-amber-700" :
                      "bg-zinc-100 text-zinc-600"
                    }`}>{m.status}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {designs.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" /> Designs
              </h2>
              <div className="divide-y rounded-xl border">
                {designs.map((d: any) => (
                  <Link key={d.id} href={`/projects/${d.project_id}/designs`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.projects?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {query.length < 2 && query.length > 0 && (
        <p className="text-sm text-muted-foreground">Type at least 2 characters to search.</p>
      )}
    </div>
  );
}
