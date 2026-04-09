"use client";

import { useTransition, useState } from "react";
import { approveItem, requestRevisionItem } from "@/app/actions/approvals";
import { Button } from "@/components/ui/button";
import { Building2, Tag, ShoppingCart, Check, X } from "lucide-react";
import { RevisionDialog } from "./revision-dialog";
import { toast } from "sonner";

interface MaterialApprovalProps {
  material: {
    id: string;
    name: string;
    brand: string | null;
    category: string | null;
    estimated_cost: number;
    room?: { name: string } | null;
  };
  projectId: string;
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ApprovalCardMaterial({ material, projectId }: MaterialApprovalProps) {
  const [isPending, startTransition] = useTransition();
  const [revisionOpen, setRevisionOpen] = useState(false);

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveItem("material", material.id, projectId, material.name);
        toast.success(`Approved ${material.name}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to approve material");
      }
    });
  };

  const handleRevisionSubmit = (reason: string) => {
    startTransition(async () => {
      try {
        await requestRevisionItem("material", material.id, projectId, material.name, reason);
        toast.success(`Revision requested for ${material.name}`);
        setRevisionOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to request revision");
      }
    });
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0 sm:flex sm:items-stretch h-full min-h-[16rem]">
          <div className="flex-1 p-6 space-y-4 flex flex-col justify-center">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {material.room && (
                  <Badge variant="secondary" className="font-medium bg-secondary/60 hover:bg-secondary/80 text-secondary-foreground">
                    <Building2 className="w-3 h-3 mr-1" />
                    {material.room.name}
                  </Badge>
                )}
                {material.category && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {material.category}
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-card-foreground">{material.name}</h3>
              {material.brand && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{material.brand}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-secondary/10 p-6 sm:w-80 flex flex-col justify-between sm:border-l border-t sm:border-t-0 border-border">
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Estimated Impact</span>
              </div>
              <div className="text-3xl font-bold tracking-tight text-foreground">
                ${Number(material.estimated_cost).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-snug">
                Approving this commits funds to your project budget.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <Button
                variant="outline"
                className="flex-1 shrink-0 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setRevisionOpen(true)}
                disabled={isPending}
                size="sm"
              >
                <X className="w-4 h-4 mr-1.5" />
                Revise
              </Button>
              <Button
                className="flex-1 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleApprove}
                disabled={isPending}
                size="sm"
              >
                <Check className="w-4 h-4 mr-1.5" />
                {isPending ? "..." : "Approve"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RevisionDialog
        open={revisionOpen}
        onOpenChange={setRevisionOpen}
        itemName={material.name}
        onSubmit={handleRevisionSubmit}
        isPending={isPending}
      />
    </>
  );
}
