"use client";

import { useActionState } from "react";
import { tradesSignIn } from "@/app/actions/trades-portal";
import { HardHat, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TradesSignInPage() {
  const [error, action, isPending] = useActionState(tradesSignIn, null);

  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glowing mesh gradients */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-gradient-to-br from-[#2F5BFF]/10 to-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <HardHat className="h-8 w-8 text-[#2F5BFF]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center">ArchiVault<sup className="text-xs select-none ml-0.5 font-bold align-super">TM</sup> Trades</h1>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Trades Portal Access</p>
          </div>
        </div>

        <Card className="border-white/10 bg-[#161618]/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#2F5BFF]" />
              Worker Sign In
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Enter the portal credentials provided by your studio administrator or architect.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form action={action} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-300 text-xs font-bold uppercase tracking-wide">Username</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  className="bg-[#1e1e20] border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-[#2F5BFF] focus-visible:border-[#2F5BFF] rounded-xl h-11"
                  placeholder="e.g. ramesh_painter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 text-xs font-bold uppercase tracking-wide">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="bg-[#1e1e20] border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-[#2F5BFF] focus-visible:border-[#2F5BFF] rounded-xl h-11"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 font-medium leading-relaxed">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full bg-[#2F5BFF] hover:bg-blue-600 text-white font-bold h-11 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
