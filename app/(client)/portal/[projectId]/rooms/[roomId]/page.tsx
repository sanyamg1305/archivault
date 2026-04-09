import { redirect } from "next/navigation";

export default async function ClientRoomIndexPage({
  params,
}: {
  params: Promise<{ projectId: string; roomId: string }>;
}) {
  const { projectId, roomId } = await params;
  redirect(`/portal/${projectId}/rooms/${roomId}/materials`);
}
