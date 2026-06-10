import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, CheckCircle, Package, AlertCircle, Home, Layers, ImageIcon } from "lucide-react";

export default async function ClientOverviewPage({ 
  params 
}: { 
  params: Promise<{ projectId: string }> 
}) {
  const { projectId } = await params;
  const { orgId } = await auth();
  const supabase = await createClerkSupabaseClient();

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  // Fetch rooms concurrently
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("project_id", projectId);

  // Fetch designs with their versions
  const { data: designs } = await supabase
    .from("designs")
    .select("*, design_versions(*)")
    .eq("project_id", projectId);

  // Fetch all materials
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("project_id", projectId);

  const roomCount = rooms?.length || 0;
  const designCount = designs?.length || 0;
  const materialCount = materials?.length || 0;

  // Calculate Approved Spend
  const approvedSpend =
    materials
      ?.filter((m) => m.status === "Approved")
      ?.reduce((sum, m) => sum + Number(m.estimated_cost), 0) || 0;

  const remainingBudget = (project?.total_budget || 0) - approvedSpend;

  // Calculate Pending Approvals (Pending Materials + Pending Design Versions)
  const pendingMaterialsCount = materials?.filter((m) => m.status === "Pending").length || 0;
  
  let pendingDesignsCount = 0;
  designs?.forEach((design) => {
    // Check if the latest version is pending
    const latestVersion = design.design_versions?.[0]; // Assuming they are returned in order, or we just check any
    if (latestVersion && latestVersion.status === "Pending") {
      pendingDesignsCount++;
    }
  });

  const totalPendingApprovals = pendingMaterialsCount + pendingDesignsCount;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{project?.name || "Project Dashboard"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to your curated view. Review progress and make pending decisions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Action Center - Highlighted */}
        <Card className="col-span-full md:col-span-1 border-primary bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-primary">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalPendingApprovals}</div>
            <p className="text-xs text-primary/80 mt-1">
              Items requiring attention
            </p>
          </CardContent>
        </Card>

        {/* Financial Highlights exactly like Architect view but read-only targeted info */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(project?.total_budget ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall allowable target</p>
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Spend</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{approvedSpend.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Locked-in decisions</p>
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Budget
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{remainingBudget.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unallocated funds</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Repository / Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Inventory</CardTitle>
            <CardDescription>Overview of documentation and spaces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-md">
                  <Home className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Configured Rooms</p>
                  <p className="text-xs text-muted-foreground mt-1">Designated spaces mapped</p>
                </div>
              </div>
              <div className="font-semibold">{roomCount}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-md">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Design Versions</p>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded floor plans & renders</p>
                </div>
              </div>
              <div className="font-semibold">{designCount}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-md">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Materials</p>
                  <p className="text-xs text-muted-foreground mt-1">Selected fixtures and finishes</p>
                </div>
              </div>
              <div className="font-semibold">{materialCount}</div>
            </div>
          </CardContent>
        </Card>

        {/* Room List - Clean list view */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Defined Spaces</CardTitle>
            <CardDescription>The active rooms for this project</CardDescription>
          </CardHeader>
          <CardContent>
            {roomCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed rounded-lg bg-slate-50/50">
                <Home className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">No rooms mapped yet</p>
                <p className="text-xs text-slate-400">The architect is setting up your project spaces.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {rooms?.map((room) => (
                  <div key={room.id} className="flex items-center gap-3 p-3 border rounded-md bg-secondary/20">
                    <Home className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">{room.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
