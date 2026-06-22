import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRound, FolderOpen } from "lucide-react";
import Link from "next/link";
import { InviteClientDialog } from "@/components/team/invite-client-dialog";

export const metadata = { title: "Clients — ArchiVault" };

export default async function ClientsPage() {
  const { orgId } = await auth();
  if (!orgId) return null;

  const clerk = await clerkClient();
  const supabase = createServiceRoleClient();

  const [{ data: memberships }, { data: projects }] = await Promise.all([
    clerk.organizations.getOrganizationMembershipList({ organizationId: orgId, limit: 100 }),
    supabase.from("projects").select("id, name, client_reference").eq("organization_id", orgId),
  ]);

  const clients = memberships
    .filter((m) => m.role === "org:member")
    .map((m) => ({
      id: m.id,
      userId: m.publicUserData?.userId ?? "",
      firstName: m.publicUserData?.firstName ?? "",
      lastName: m.publicUserData?.lastName ?? "",
      email: m.publicUserData?.identifier ?? "",
      imageUrl: m.publicUserData?.imageUrl,
    }));

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">All clients with portal access to your projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <UserRound className="w-4 h-4 mr-2" />
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </Badge>
          <InviteClientDialog />
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed rounded-xl border-muted bg-muted/10">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-lg font-semibold">No clients yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
            Invite clients so they can access their project portal, approve designs, and track progress.
          </p>
          <InviteClientDialog />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const displayName = client.firstName || client.lastName
              ? `${client.firstName} ${client.lastName}`.trim()
              : client.email;
            const initials = (client.firstName?.[0] ?? client.email[0] ?? "?").toUpperCase();

            // Find projects where client_reference matches this client's email
            const clientProjects = (projects ?? []).filter(
              (p) => p.client_reference?.toLowerCase() === client.email.toLowerCase()
            );

            return (
              <Card key={client.id} className="border-muted">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    {client.imageUrl ? (
                      <img src={client.imageUrl} alt="" className="h-11 w-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    </div>
                  </div>

                  {clientProjects.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Projects</p>
                      {clientProjects.map((p) => (
                        <Link
                          key={p.id}
                          href={`/projects/${p.id}`}
                          className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                        >
                          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
