import { redirect } from "next/navigation";

export default async function ActionCenterIndexPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/portal/${projectId}/action-center/design-approvals`);
}
