import { UserButton } from "@clerk/nextjs";
import { HardHat } from "lucide-react";

export default function TradesPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <HardHat className="h-5 w-5 text-primary" />
          <span>ArchiVault Trades</span>
        </div>
        <UserButton />
      </header>
      <main className="max-w-3xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
