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
import { createVendor } from "@/app/actions/vendors";
import { VENDOR_CATEGORIES } from "@/lib/vendor-categories";

export function AddVendorDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createVendor({ name: fd.get("name") as string, phone: fd.get("phone") as string, city: fd.get("city") as string, category, notes: fd.get("notes") as string });
        toast.success("Vendor added");
        setOpen(false);
        setCategory("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCategory(""); }}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Vendor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
          <DialogDescription>Add a material supplier to your directory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="v-name">Vendor Name <span className="text-destructive">*</span></Label>
            <Input id="v-name" name="name" required placeholder="e.g. Kajaria Tiles Mumbai" />
          </div>
          <div className="space-y-2">
            <Label>Category <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="v-phone">Phone</Label>
              <Input id="v-phone" name="phone" type="tel" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-city">City</Label>
              <Input id="v-city" name="city" placeholder="e.g. Mumbai" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-notes">Notes</Label>
            <Textarea id="v-notes" name="notes" rows={2} placeholder="Speciality, payment terms, lead time…" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !category}>
            {isPending ? "Adding…" : "Add Vendor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
