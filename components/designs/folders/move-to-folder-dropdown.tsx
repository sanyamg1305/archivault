"use client";

import { useTransition } from "react";
import { FolderInput, FolderX } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { moveDesignToFolder } from "@/app/actions/design-folders";

export function MoveToFolderDropdown({
  designId,
  projectId,
  folders,
  currentFolderId,
}: {
  designId: string;
  projectId: string;
  folders: { id: string; name: string }[];
  currentFolderId: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function move(folderId: string | null) {
    startTransition(async () => {
      try {
        await moveDesignToFolder(designId, projectId, folderId);
        toast.success(folderId ? "Moved to folder" : "Removed from folder");
      } catch {
        toast.error("Failed to move design");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 px-2 gap-1.5 text-xs shadow-sm"
          disabled={isPending}
        >
          <FolderInput className="h-3.5 w-3.5" />
          Move
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs">Move to folder</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {folders.length === 0 && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            No folders created yet
          </DropdownMenuItem>
        )}
        {folders.map((f) => (
          <DropdownMenuItem
            key={f.id}
            onSelect={() => move(f.id)}
            disabled={f.id === currentFolderId}
            className="text-sm"
          >
            {f.name}
            {f.id === currentFolderId && (
              <span className="ml-auto text-xs text-muted-foreground">current</span>
            )}
          </DropdownMenuItem>
        ))}
        {currentFolderId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => move(null)} className="text-sm text-muted-foreground">
              <FolderX className="h-4 w-4 mr-2" /> Remove from folder
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
