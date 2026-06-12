import { SignIn } from "@clerk/nextjs";
import { HardHat } from "lucide-react";

export default function TradesSignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-white mb-1">
          <HardHat className="h-7 w-7" />
          <span className="text-2xl font-bold tracking-tight">ArchiVault Trades</span>
        </div>
        <p className="text-zinc-400 text-sm max-w-xs">
          Sign in with your mobile number to view your assigned tasks.
        </p>
      </div>
      <SignIn
        routing="path"
        path="/trades-portal/sign-in"
        signUpUrl="/trades-portal/sign-in"
        fallbackRedirectUrl="/trades-portal/dashboard"
      />
    </div>
  );
}
