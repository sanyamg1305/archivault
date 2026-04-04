import { createClerkSupabaseClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, CheckCircle } from "lucide-react";

export default async function ProjectOverview({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClerkSupabaseClient();

  // Fetch Budget Details
  const { data: project } = await supabase
    .from("projects")
    .select("total_budget")
    .eq("id", projectId)
    .single();

  // Fetch Approved Spend (Sum of approved materials)
  const { data: approvedMaterials } = await supabase
    .from("materials")
    .select("estimated_cost")
    .eq("project_id", projectId)
    .eq("status", "Approved");

  const approvedSpend =
    approvedMaterials?.reduce(
      (sum, m) => sum + Number(m.estimated_cost),
      0
    ) || 0;
  const remainingBudget = (project?.total_budget || 0) - approvedSpend;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Financial Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time budget health for this project.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${project?.total_budget.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Spend</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${approvedSpend.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Budget
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${remainingBudget.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
