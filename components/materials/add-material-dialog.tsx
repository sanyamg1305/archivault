"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ImagePlus } from "lucide-react";
import { createMaterial, uploadMaterialImage } from "@/app/actions/materials";
import { toast } from "sonner";

export function AddMaterialDialog({ projectId, rooms, defaultRoomId }: { projectId: string; rooms: any[]; defaultRoomId?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const material = await createMaterial({
        projectId,
        roomId: formData.get("roomId") as string,
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        brand: formData.get("brand") as string,
        vendor: formData.get("vendor") as string,
        estimated_cost: Number(formData.get("estimated_cost")),
      });

      if (imageFile && material) {
        const imgFormData = new FormData();
        imgFormData.append("materialId", material.id);
        imgFormData.append("projectId", projectId);
        imgFormData.append("file", imageFile);
        await uploadMaterialImage(imgFormData);
      }

      setOpen(false);
      setImageFile(null);
      setImagePreview(null);
      toast.success("Material Added");
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setImageFile(null); setImagePreview(null); } }}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Material</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>Enter selection details and estimated cost.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room</Label>
              <Select name="roomId" required defaultValue={defaultRoomId}>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {rooms.map(room => <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input name="category" placeholder="e.g. Lighting" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Material Name</Label>
            <Input name="name" placeholder="e.g. Brass Pendant" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="brand" placeholder="Brand" />
            <Input name="vendor" placeholder="Vendor or URL" />
          </div>
          <div className="space-y-2">
            <Label>Estimated Cost ($)</Label>
            <Input name="estimated_cost" type="number" step="0.01" required />
          </div>

          {/* Optional image */}
          <div className="space-y-2">
            <Label>Reference Image (optional)</Label>
            <div
              className="flex items-center gap-3 p-3 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
              ) : (
                <div className="h-16 w-16 bg-secondary/50 rounded flex items-center justify-center">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {imageFile ? imageFile.name : "Click to add a photo"}
              </p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Save Material"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
