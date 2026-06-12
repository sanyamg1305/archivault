"use client";

import { useActionState } from "react";
import { tradesSignIn } from "@/app/actions/trades-portal";
import { HardHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TradesSignInPage() {
  const [error, action, isPending] = useActionState(tradesSignIn, null);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-white">
            <HardHat className="h-7 w-7" />
            <span className="text-2xl font-bold tracking-tight">ArchiVault Trades</span>
          </div>
          <p className="text-zinc-400 text-sm">Sign in to view your assigned tasks</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">Worker Sign In</CardTitle>
            <CardDescription className="text-zinc-400">
              Use the username and password your architect set for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-zinc-300">Username</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-500"
                  placeholder="e.g. ramesh_painter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
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
