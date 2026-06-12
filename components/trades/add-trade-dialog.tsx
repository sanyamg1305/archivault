"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTrade } from "@/app/actions/trades";

export const TRADE_TYPES = [
  "Painter", "Plumber", "Electrician", "Carpenter", "Mason",
  "Tiler", "Welder", "HVAC", "Landscaper", "Other",
];

export function AddTradeDialog() {
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createTrade({
          name: fd.get("name") as string,
          trade_type: tradeType,
          phone: fd.get("phone") as string,
          notes: fd.get("notes") as string,
        });
        toast.success("Trade worker added");
        setOpen(false);
        setTradeType("");
      } catch (err) {
        toast.error("Failed", { description: err instanceof Error ? err.message : "Try again." });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTradeType(""); }}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Trade Worker</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add Trade Worker</DialogTitle>
          <DialogDescription>Add a painter, plumber, electrician or other trade to your team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" required placeholder="e.g. Ramesh Kumar" />
          </div>
          <div className="space-y-2">
            <Label>Trade Type <span className="text-destructive">*</span></Label>
            <Select value={tradeType} onValueChange={setTradeType} required>
              <SelectTrigger><SelectValue placeholder="Select trade…" /></SelectTrigger>
              <SelectContent>
                {TRADE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} placeholder="Specialisation, availability, rates…" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !tradeType}>
            {isPending ? "Adding…" : "Add Worker"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
