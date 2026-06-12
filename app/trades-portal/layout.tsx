import { HardHat } from "lucide-react";
import { TradesSignOutButton } from "@/components/trades/trades-sign-out-button";

export default function TradesPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <HardHat className="h-5 w-5 text-primary" />
          <span>ArchiVault Trades</span>
        </div>
        <TradesSignOutButton />
      </header>
      <main className="max-w-3xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
