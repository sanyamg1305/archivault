"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { updateMaterialStatus, deleteMaterial } from "@/app/actions/materials";
import { EditMaterialDialog } from "./edit-material-dialog";
import { MaterialImageUpload } from "./material-image-upload";
import { toast } from "sonner";
import { MATERIAL_CATEGORIES, getCategoryColor } from "@/lib/material-categories";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  "Revision Requested": "bg-blue-100 text-blue-800",
  Superseded: "bg-gray-100 text-gray-600",
};

const ALL_STATUSES = ["All", "Pending", "Approved", "Revision Requested", "Rejected"];

export function MaterialsTable({ materials, projectId, isAdminOrTeam }: {
  materials: any[];
  projectId: string;
  isAdminOrTeam: boolean;
}) {
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [viewFeedbackMaterial, setViewFeedbackMaterial] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = materials.filter((m) => {
    const matchesSearch =
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.brand?.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase()) ||
      m.vendor?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || m.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  async function handleDelete(id: string, name: string) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteMaterial(id, projectId, name);
        toast.success("Material Deleted");
      } catch (error: any) {
        toast.error("Error", { description: error.message });
      }
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, brand, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {MATERIAL_CATEGORIES.map(c => (
              <SelectItem key={c.label} value={c.label}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Material</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  {search || statusFilter !== "All" ? "No materials match your filters." : "No materials yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  {/* Image thumbnail / upload */}
                  <TableCell className="py-2">
                    <MaterialImageUpload
                      materialId={m.id}
                      projectId={projectId}
                      imageUrl={m.imageUrl ?? null}
                      size="sm"
                    />
                  </TableCell>

                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{m.name}</span>
                      {m.category && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getCategoryColor(m.category)}`}>
                          {m.category}
                        </span>
                      )}
                    </div>
                    {(m.brand || m.vendor) && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {m.brand && <span>{m.brand}</span>}
                        {m.brand && m.vendor && <span> • </span>}
                        {m.vendor && (
                          m.vendor.startsWith("http://") || m.vendor.startsWith("https://") ? (
                            <a href={m.vendor} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                              {new URL(m.vendor).hostname}
                            </a>
                          ) : (
                            <span>{m.vendor}</span>
                          )
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>{m.rooms?.name}</TableCell>
                  <TableCell>₹{m.estimated_cost.toLocaleString('en-IN')}</TableCell>

                  <TableCell>
                    <Badge variant="secondary" className={statusColors[m.status]}>{m.status}</Badge>
                    {m.status === "Revision Requested" && m.revision_note && (
                      <div className="mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => setViewFeedbackMaterial(m)}
                        >
                          View Feedback
                        </Button>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {m.status === "Pending" && (
                        <Button
                          size="sm" variant="ghost" className="text-green-600 h-8"
                          onClick={() => updateMaterialStatus(projectId, m.id, m.name, "Approved")}
                        >Approve</Button>
                      )}
                      {m.status === "Revision Requested" && isAdminOrTeam && (
                        <Button
                          size="sm" variant="ghost" className="text-blue-600 h-8"
                          onClick={() => updateMaterialStatus(projectId, m.id, m.name, "Pending")}
                        >Resubmit for Review</Button>
                      )}

                      {isAdminOrTeam && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingMaterial(m)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => handleDelete(m.id, m.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Material
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingMaterial && (
        <EditMaterialDialog
          material={editingMaterial}
          projectId={projectId}
          open={!!editingMaterial}
          setOpen={(open) => !open && setEditingMaterial(null)}
        />
      )}

      {viewFeedbackMaterial && (
        <Dialog open={!!viewFeedbackMaterial} onOpenChange={(open) => !open && setViewFeedbackMaterial(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revision Feedback</DialogTitle>
              <DialogDescription>
                Client requested changes for material: <span className="font-semibold text-foreground">{viewFeedbackMaterial.name}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border p-4 bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap mt-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70 block mb-2">Request Details</span>
              {viewFeedbackMaterial.revision_note}
            </div>
            <div className="mt-2 flex justify-end">
              <Button onClick={() => setViewFeedbackMaterial(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
