"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateMaterial } from "@/app/actions/materials";
import { toast } from "sonner";
import { MATERIAL_CATEGORIES } from "@/lib/material-categories";

export function EditMaterialDialog({ material, projectId, open, setOpen }: {
  material: any;
  projectId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(material.category ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      await updateMaterial(material.id, projectId, {
        name: formData.get("name") as string,
        category,
        brand: formData.get("brand") as string,
        vendor: formData.get("vendor") as string,
        estimated_cost: Number(formData.get("estimated_cost")),
        status: formData.get("status") as string,
      });
      setOpen(false);
      toast.success("Material Updated");
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>Update the details for {material.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Material Name</Label>
            <Input name="name" defaultValue={material.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map(c => (
                    <SelectItem key={c.label} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={material.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Revision Requested">Revision Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input name="brand" defaultValue={material.brand} />
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input name="vendor" defaultValue={material.vendor} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Estimated Cost ($)</Label>
            <Input name="estimated_cost" type="number" step="0.01" defaultValue={material.estimated_cost} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
