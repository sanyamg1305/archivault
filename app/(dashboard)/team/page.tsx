import { auth, clerkClient } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const metadata = { title: "Team — ArchiVault" };

export default async function TeamPage() {
  const { orgId } = await auth();
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

  const admins = members.filter((m) => m.role === "org:admin");
  const clients = members.filter((m) => m.role !== "org:admin");

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1">Everyone with access to your organization.</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          <Users className="w-4 h-4 mr-2" />
          {members.length} {members.length === 1 ? "member" : "members"}
        </Badge>
      </div>

      <MemberGroup title="Architects & Team" members={admins} />
      <MemberGroup title="Clients" members={clients} emptyText="No clients added yet. Use 'Assign Client' on a project to invite them." />
    </div>
  );
}

function MemberGroup({ title, members, emptyText }: { title: string; members: any[]; emptyText?: string }) {
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
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {m.firstName || m.lastName ? `${m.firstName} ${m.lastName}`.trim() : m.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
