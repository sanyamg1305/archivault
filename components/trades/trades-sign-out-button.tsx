"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tradesSignOut } from "@/app/actions/trades-portal";

export function TradesSignOutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => tradesSignOut())}
      className="gap-2 text-muted-foreground"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
