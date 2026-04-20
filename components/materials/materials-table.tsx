"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

export function MaterialsTable({ materials, projectId, isAdminOrTeam }: {
  materials: any[];
  projectId: string;
  isAdminOrTeam: boolean
}) {
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [viewFeedbackMaterial, setViewFeedbackMaterial] = useState<any>(null);

  const statusColors: any = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    "Revision Requested": "bg-blue-100 text-blue-800",
  };

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">
                  <div>{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.brand} • {m.category}</div>
                </TableCell>
                <TableCell>{m.rooms?.name}</TableCell>
                <TableCell>${m.estimated_cost.toLocaleString()}</TableCell>
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
                    {/* Fast Approval Actions for Pending items */}
                    {m.status === "Pending" && (
                      <>
                        <Button
                          size="sm" variant="ghost" className="text-green-600 h-8"
                          onClick={() => updateMaterialStatus(projectId, m.id, m.name, "Approved")}
                        >Approve</Button>
                      </>
                    )}

                    {/* Full CRUD Dropdown (Admin/Team Only) */}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Hidden Edit Dialog triggered by state */}
      {editingMaterial && (
        <EditMaterialDialog
          material={editingMaterial}
          projectId={projectId}
          open={!!editingMaterial}
          setOpen={(open) => !open && setEditingMaterial(null)}
        />
      )}

      {/* Hidden Feedback Dialog triggered by state */}
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
