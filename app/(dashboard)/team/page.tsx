import { auth, clerkClient } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";

export const metadata = { title: "Team - ArchiVault" };

export default async function TeamPage() {
  const { orgId, orgRole } = await auth();
  if (!orgId) return null;

  const clerk = await clerkClient();
  const { data: memberships } = await clerk.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: 100,
  });

  const members = memberships.map((m) => ({
    id: m.id,
    role: m.role,
    firstName: m.publicUserData?.firstName ?? "",
    lastName: m.publicUserData?.lastName ?? "",
    email: m.publicUserData?.identifier ?? "",
    imageUrl: m.publicUserData?.imageUrl,
  }));

  const admins = members.filter((m) => m.role === "org:admin" || m.role === "admin");
  const architects = members.filter((m) => m.role === "org:architect" || m.role === "architect");
  const total = admins.length + architects.length;
  const isAdmin = orgRole === "org:admin" || orgRole === "admin";

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1">Architects and staff with access to your organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Users className="w-4 h-4 mr-2" />
            {total} {total === 1 ? "member" : "members"}
          </Badge>
          {isAdmin && <InviteMemberDialog />}
        </div>
      </div>

      <MemberGroup
        title="Admins"
        roleBadge="Admin"
        roleColor="bg-primary/10 text-primary"
        members={admins}
        emptyText="No admins."
      />
      <MemberGroup
        title="Team Members"
        roleBadge="Team Member"
        roleColor="bg-blue-100 text-blue-700"
        members={architects}
        emptyText="No team members yet. Invite an architect to collaborate on projects."
      />
    </div>
  );
}

function MemberGroup({
  title, roleBadge, roleColor, members, emptyText,
}: {
  title: string; roleBadge: string; roleColor: string; members: any[]; emptyText?: string;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{title}</h2>
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-6 text-center">{emptyText ?? "None."}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m: any) => (
            <Card key={m.id} className="border-muted">
              <CardContent className="p-4 flex items-center gap-3">
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground">
                    {(m.firstName?.[0] ?? m.email[0] ?? "?").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {m.firstName || m.lastName ? `${m.firstName} ${m.lastName}`.trim() : m.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleColor}`}>
                  {roleBadge}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
