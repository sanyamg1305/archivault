import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { Phone, HardHat, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddTradeDialog } from "@/components/trades/add-trade-dialog";
import { EditTradeDialog } from "@/components/trades/edit-trade-dialog";

export const metadata = { title: "Trades — ArchiVault" };

const TRADE_COLORS: Record<string, string> = {
  Painter:      "bg-yellow-100 text-yellow-700",
  Plumber:      "bg-blue-100 text-blue-700",
  Electrician:  "bg-orange-100 text-orange-700",
  Carpenter:    "bg-amber-100 text-amber-700",
  Mason:        "bg-stone-100 text-stone-700",
  Tiler:        "bg-teal-100 text-teal-700",
  Welder:       "bg-red-100 text-red-700",
  HVAC:         "bg-cyan-100 text-cyan-700",
  Landscaper:   "bg-green-100 text-green-700",
  Other:        "bg-secondary text-secondary-foreground",
};

function tradeColor(type: string) {
  return TRADE_COLORS[type] ?? TRADE_COLORS["Other"];
}

export default async function TradesPage() {
  const { orgId } = await auth();
  if (!orgId) return null;

  const supabase = createServiceRoleClient();
  const { data: trades } = await supabase
    .from("trades")
    .select("*")
    .eq("organization_id", orgId)
    .order("trade_type")
    .order("name");

  // Group by trade_type
  const grouped: Record<string, any[]> = {};
  for (const t of trades ?? []) {
    if (!grouped[t.trade_type]) grouped[t.trade_type] = [];
    grouped[t.trade_type].push(t);
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground mt-1">
            Your in-house trade workers — painters, plumbers, electricians and more.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <HardHat className="w-4 h-4 mr-2" />
            {trades?.length ?? 0} workers
          </Badge>
          <AddTradeDialog />
        </div>
      </div>

      {(!trades || trades.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-center">
          <HardHat className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium">No trade workers yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your painters, plumbers, electricians and other in-house trades.
          </p>
        </div>
      )}

      {Object.entries(grouped).map(([type, workers]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              {type}
            </h2>
            <span className="text-xs text-muted-foreground">({workers.length})</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((worker: any) => (
              <Card key={worker.id} className="border-muted group relative">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{worker.name}</p>
                      <Badge className={`text-xs mt-1 ${tradeColor(worker.trade_type)}`} variant="outline">
                        {worker.trade_type}
                      </Badge>
                    </div>
                    <EditTradeDialog trade={worker} />
                  </div>
                  <div className="space-y-1">
                      {worker.phone && (
                        <a
                          href={`tel:${worker.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {worker.phone}
                        </a>
                      )}
                      {worker.username ? (
                        <p className="flex items-center gap-2 text-xs text-green-600">
                          <KeyRound className="h-3.5 w-3.5 shrink-0" />
                          Portal login: <span className="font-mono font-medium">{worker.username}</span>
                        </p>
                      ) : (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <KeyRound className="h-3.5 w-3.5 shrink-0" />
                          No login set — use ⋯ → Set Login
                        </p>
                      )}
                    </div>
                  {worker.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{worker.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
