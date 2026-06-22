"use client";

import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyLinkButton({ projectId }: { projectId: string }) {
  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/portal/${projectId}/dashboard`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Client portal link copied!");
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 opacity-0 group-hover/wrap:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      title="Copy client portal link"
    >
      <Link2 className="h-3.5 w-3.5" />
    </Button>
  );
}
