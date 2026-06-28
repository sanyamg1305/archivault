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
import { updateVendor, deleteVendor } from "@/app/actions/vendors";
import { VENDOR_CATEGORIES } from "@/lib/vendor-categories";

export function EditVendorDialog({ vendor }: { vendor: any }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(vendor.category);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateVendor(vendor.id, { name: fd.get("name") as string, phone: fd.get("phone") as string, city: fd.get("city") as string, category, notes: fd.get("notes") as string });
        toast.success("Updated");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try { await deleteVendor(vendor.id); toast.success("Vendor removed"); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
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
          <DropdownMenuItem onClick={() => setOpen(true)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Edit Vendor</DialogTitle><DialogDescription>Update vendor details.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="ev-name">Name</Label>
              <Input id="ev-name" name="name" required defaultValue={vendor.name} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VENDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ev-phone">Phone</Label>
                <Input id="ev-phone" name="phone" defaultValue={vendor.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-city">City</Label>
                <Input id="ev-city" name="city" defaultValue={vendor.city ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-notes">Notes</Label>
              <Textarea id="ev-notes" name="notes" rows={2} defaultValue={vendor.notes ?? ""} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
