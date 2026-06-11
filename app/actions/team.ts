"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function inviteTeamMember(email: string, role: string) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  if (orgRole !== "org:admin") throw new Error("Only admins can invite members.");

  const clerk = await clerkClient();
  await clerk.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role: role as "org:admin" | "org:member",
    inviterUserId: userId,
  });

  revalidatePath("/team");
}
