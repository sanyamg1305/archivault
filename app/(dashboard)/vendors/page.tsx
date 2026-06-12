import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { AddVendorDialog } from "@/components/vendors/add-vendor-dialog";
import { EditVendorDialog } from "@/components/vendors/edit-vendor-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Store } from "lucide-react";

export const metadata = { title: "Vendors — ArchiVault" };

export default async function VendorsPage() {
  const { orgId } = await auth();
  if (!orgId) return null;

  const supabase = createServiceRoleClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .eq("organization_id", orgId)
    .order("category").order("name");

  const grouped: Record<string, any[]> = {};
  for (const v of vendors ?? []) {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category].push(v);
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">Your material suppliers and vendors.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Store className="w-4 h-4 mr-2" />{vendors?.length ?? 0} vendors
          </Badge>
          <AddVendorDialog />
        </div>
      </div>

      {(!vendors || vendors.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <Store className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No vendors yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add tile suppliers, paint vendors, electricals shops and more.</p>
        </div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{category}</h2>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((v: any) => (
              <Card key={v.id} className="border-muted group relative">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{v.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{v.category}</Badge>
                    </div>
                    <EditVendorDialog vendor={v} />
                  </div>
                  <div className="space-y-1">
                    {v.phone && (
                      <a href={`tel:${v.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="h-3.5 w-3.5 shrink-0" />{v.phone}
                      </a>
                    )}
                    {v.city && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />{v.city}
                      </p>
                    )}
                  </div>
                  {v.notes && <p className="text-xs text-muted-foreground line-clamp-2">{v.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
