import { redirect } from "next/navigation";

export default async function RoomIndexPage({
  params,
}: {
  params: Promise<{ projectId: string; roomId: string }>;
}) {
  const { projectId, roomId } = await params;
  redirect(`/projects/${projectId}/rooms/${roomId}/materials`);
}
