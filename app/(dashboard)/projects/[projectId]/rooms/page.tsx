import { createServiceRoleClient } from "@/utils/supabase/server";
import { CreateRoomDialog } from "@/components/projects/create-room-dialog";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from "lucide-react";
import Link from "next/link";

export default async function RoomsPage({
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Project Rooms</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your project by space or area.
          </p>
        </div>
        <CreateRoomDialog projectId={projectId} />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {rooms?.map((room) => (
          <Link key={room.id} href={`/projects/${projectId}/rooms/${room.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <Box className="h-5 w-5 text-muted-foreground shrink-0" />
                <CardTitle className="text-base">{room.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}

        {rooms?.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-lg">
            <Box className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">
              No rooms defined yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a room to start organising materials by space.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
