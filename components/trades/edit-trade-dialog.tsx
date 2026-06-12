"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateTrade, deleteTrade } from "@/app/actions/trades";
import { TRADE_TYPES } from "./add-trade-dialog";
import { SetCredentialsDialog } from "./set-credentials-dialog";

export function EditTradeDialog({ trade }: { trade: any; username?: string | null }) {
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState(trade.trade_type);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateTrade(trade.id, {
          name: fd.get("name") as string,
          trade_type: tradeType,
          phone: fd.get("phone") as string,
          notes: fd.get("notes") as string,
        });
        toast.success("Updated");
        setOpen(false);
      } catch (err) {
        toast.error("Failed", { description: err instanceof Error ? err.message : "Try again." });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTrade(trade.id);
        toast.success("Trade worker removed");
      } catch (err) {
        toast.error("Failed", { description: err instanceof Error ? err.message : "Try again." });
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <SetCredentialsDialog
            tradeId={trade.id}
            tradeName={trade.name}
            currentUsername={trade.username ?? null}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Edit Trade Worker</DialogTitle>
            <DialogDescription>Update contact details or trade type.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" name="name" required defaultValue={trade.name} />
            </div>
            <div className="space-y-2">
              <Label>Trade Type</Label>
              <Select value={tradeType} onValueChange={setTradeType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRADE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Mobile Number</Label>
              <Input id="edit-phone" name="phone" type="tel" defaultValue={trade.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" name="notes" rows={2} defaultValue={trade.notes ?? ""} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
