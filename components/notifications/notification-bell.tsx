"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { markAllRead, markOneRead } from "@/app/actions/notifications";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NotificationBell({
  notifications,
  userId,
}: {
  notifications: any[];
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const unread = notifications.filter(n => !(n.read_by ?? []).includes(userId));

  function handleMarkAll() {
    startTransition(async () => {
      await markAllRead();
      router.refresh();
    });
  }

  function handleClickNotif(n: any) {
    startTransition(async () => {
      await markOneRead(n.id);
      router.refresh();
    });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleMarkAll} disabled={isPending}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
          )}
          {notifications.map(n => {
            const isUnread = !(n.read_by ?? []).includes(userId);
            return (
              <div
                key={n.id}
                className={`px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${isUnread ? "bg-primary/5" : ""}`}
                onClick={() => handleClickNotif(n)}
              >
                <div className="flex items-start gap-2">
                  {isUnread && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                  <div className={`min-w-0 ${!isUnread ? "pl-4" : ""}`}>
                    <p className="text-sm font-medium leading-tight">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {n.link && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
