import { createServiceRoleClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Building2 } from "lucide-react";
import Link from "next/link";

export default async function ClientRoomsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: floors }, { data: rooms }] = await Promise.all([
    supabase
      .from("floors")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("rooms")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
  ]);

  const allFloors = floors ?? [];
  const allRooms = rooms ?? [];
  const unassigned = allRooms.filter((r) => !r.floor_id);

  function roomsForFloor(floorId: string) {
    return allRooms.filter((r) => r.floor_id === floorId);
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-semibold">Rooms</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse designs and materials by room.</p>
      </div>

      {allFloors.length === 0 && allRooms.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed rounded-lg bg-slate-50/50">
          <Box className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No rooms available yet.</p>
        </div>
      )}

      {allFloors.map((floor) => {
        const floorRooms = roomsForFloor(floor.id);
        if (floorRooms.length === 0) return null;
        return (
          <div key={floor.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{floor.name}</h3>
              <span className="text-xs text-muted-foreground">{floorRooms.length} room{floorRooms.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              {floorRooms.map((room) => (
                <Link key={room.id} href={`/portal/${projectId}/rooms/${room.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-3 p-4">
                      <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <CardTitle className="text-sm truncate">{room.name}</CardTitle>
                        {room.room_type && (
                          <p className="text-xs text-muted-foreground truncate">{room.room_type}</p>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {unassigned.length > 0 && (
        <div className="space-y-3">
          {allFloors.length > 0 && (
            <h3 className="text-sm font-semibold text-muted-foreground">Other Rooms</h3>
          )}
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {unassigned.map((room) => (
              <Link key={room.id} href={`/portal/${projectId}/rooms/${room.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center gap-3 p-4">
                    <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{room.name}</CardTitle>
                      {room.room_type && (
                        <p className="text-xs text-muted-foreground truncate">{room.room_type}</p>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
