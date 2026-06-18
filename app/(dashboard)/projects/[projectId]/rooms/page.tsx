import { createServiceRoleClient } from "@/utils/supabase/server";
import { CreateFloorDialog } from "@/components/projects/create-floor-dialog";
import { FloorSection } from "@/components/projects/floor-section";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Building2 } from "lucide-react";
import Link from "next/link";

export default async function RoomsPage({
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Floors & Rooms</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create floors first, then add rooms to each floor.
          </p>
        </div>
        <CreateFloorDialog projectId={projectId} nextSortOrder={allFloors.length} />
      </div>

      {allFloors.length === 0 && unassigned.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed rounded-lg">
          <Building2 className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No floors yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click <span className="font-semibold">Add Floor</span> to get started, then add rooms to each floor.
          </p>
        </div>
      )}

      {/* Floors */}
      {allFloors.map((floor) => {
        const floorRooms = roomsForFloor(floor.id);
        return (
          <FloorSection
            key={floor.id}
            floor={floor}
            projectId={projectId}
            roomCount={floorRooms.length}
          >
            {floorRooms.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground">
                No rooms on this floor yet. Click <span className="font-medium">Add Room</span> above.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {floorRooms.map((room) => (
                  <Link key={room.id} href={`/projects/${projectId}/rooms/${room.id}`}>
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
            )}
          </FloorSection>
        );
      })}

      {/* Unassigned rooms (rooms created before floors existed) */}
      {unassigned.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Unassigned</h3>
            <span className="text-xs text-muted-foreground">{unassigned.length} room{unassigned.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {unassigned.map((room) => (
              <Link key={room.id} href={`/projects/${projectId}/rooms/${room.id}`}>
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
