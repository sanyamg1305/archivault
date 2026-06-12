"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteSitePhoto } from "@/app/actions/site-photos";

export function ProgressPhotoGrid({ photos, projectId }: { photos: any[]; projectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, filePath: string) {
    startTransition(async () => {
      try {
        await deleteSitePhoto(id, filePath, projectId);
        toast.success("Photo deleted");
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {photos.map((p: any) => (
        <div key={p.id} className="group relative rounded-lg overflow-hidden border aspect-square bg-muted">
          {p.signedUrl && (
            <Image src={p.signedUrl} alt={p.caption ?? "Progress photo"} fill className="object-cover" sizes="200px" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          {p.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-xs text-white line-clamp-2">{p.caption}</p>
              {p.rooms?.name && <p className="text-xs text-white/70">{p.rooms.name}</p>}
            </div>
          )}
          <button
            onClick={() => handleDelete(p.id, p.file_path)}
            disabled={isPending}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
