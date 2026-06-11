import { createServiceRoleClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from "lucide-react";
import Link from "next/link";

export default async function ClientRoomsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServiceRoleClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Project Rooms</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse designs and materials by room.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {rooms?.map((room) => (
          <Link key={room.id} href={`/portal/${projectId}/rooms/${room.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <Box className="h-5 w-5 text-muted-foreground shrink-0" />
                <CardTitle className="text-base">{room.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}

        {rooms?.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-lg bg-slate-50/50">
            <Box className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">
              No rooms available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
