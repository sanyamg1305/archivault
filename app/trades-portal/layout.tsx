import { HardHat } from "lucide-react";
import { TradesSignOutButton } from "@/components/trades/trades-sign-out-button";
import { getTradesSession } from "@/utils/trades-auth";

export default async function TradesPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getTradesSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {isLoggedIn && (
        <header className="border-b bg-card px-6 py-3 flex items-center justify-between shadow-sm relative z-20">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <HardHat className="h-5 w-5 text-[#2F5BFF]" />
            <span>ArchiVault<sup className="text-[8px] select-none ml-0.5 font-bold align-super">TM</sup> Trades</span>
          </div>
          <TradesSignOutButton />
        </header>
      )}
      <main className={isLoggedIn ? "flex-1 max-w-3xl w-full mx-auto p-6 relative z-10" : "flex-1 w-full"}>
        {children}
      </main>
    </div>
  );
}
