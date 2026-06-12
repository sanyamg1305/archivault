"use client";

import { useState, useTransition } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setTradeCredentials } from "@/app/actions/trades-portal";

export function SetCredentialsDialog({
  tradeId,
  tradeName,
  currentUsername,
}: {
  tradeId: string;
  tradeName: string;
  currentUsername: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await setTradeCredentials(tradeId, username, password);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Login credentials saved");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true); }}>
          <KeyRound className="h-4 w-4 mr-2" /> Set Login
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Set Login for {tradeName}</DialogTitle>
          <DialogDescription>
            Create or update the username and password this worker uses to sign in at{" "}
            <span className="font-mono text-xs">/trades-portal/sign-in</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="cred-username">Username</Label>
            <Input
              id="cred-username"
              name="username"
              required
              defaultValue={currentUsername ?? ""}
              placeholder="e.g. ramesh_painter"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">Lowercase letters, numbers and underscores only.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-password">
              {currentUsername ? "New Password" : "Password"}
            </Label>
            <div className="relative">
              <Input
                id="cred-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cred-confirm">Confirm Password</Label>
            <Input
              id="cred-confirm"
              name="confirm"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : currentUsername ? "Update Credentials" : "Save Credentials"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
