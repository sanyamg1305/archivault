"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Link2, Trash2, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteMoodBoardItem } from "@/app/actions/mood-board";

type Item = {
  id: string;
  type: "image" | "link";
  image_url?: string | null;
  signedUrl?: string | null;
  link_url?: string | null;
  title?: string | null;
  notes?: string | null;
  added_by_name: string;
  created_at: string;
  room_id?: string | null;
};

function ImageCard({ item, canDelete, projectId }: { item: Item; canDelete: boolean; projectId: string }) {
  const [lightbox, setLightbox] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Remove this image?")) return;
    startTransition(async () => {
      try {
        await deleteMoodBoardItem(item.id, projectId, item.image_url ?? undefined);
        toast.success("Removed");
      } catch {
        toast.error("Failed to remove");
      }
    });
  }

  return (
    <>
      <div
        className="group relative aspect-square rounded-xl overflow-hidden border bg-muted cursor-zoom-in"
        onClick={() => setLightbox(true)}
      >
        {item.signedUrl && (
          <Image src={item.signedUrl} alt={item.title ?? "Inspiration"} fill unoptimized sizes="300px" className="object-cover transition-transform group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="self-end bg-black/60 text-white rounded-full p-1.5 hover:bg-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          {(item.title || item.notes) && (
            <div className="rounded-lg bg-black/60 backdrop-blur-sm p-2">
              {item.title && <p className="text-white text-xs font-semibold truncate">{item.title}</p>}
              {item.notes && <p className="text-white/70 text-xs truncate">{item.notes}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(false)}>
            <X className="h-6 w-6" />
          </button>
          {item.signedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.signedUrl} alt={item.title ?? ""} className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          )}
          {(item.title || item.notes) && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              {item.title && <p className="text-white font-semibold">{item.title}</p>}
              {item.notes && <p className="text-white/70 text-sm mt-0.5">{item.notes}</p>}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function LinkCard({ item, canDelete, projectId }: { item: Item; canDelete: boolean; projectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Remove this link?")) return;
    startTransition(async () => {
      try {
        await deleteMoodBoardItem(item.id, projectId);
        toast.success("Removed");
      } catch {
        toast.error("Failed to remove");
      }
    });
  }

  const hostname = (() => {
    try { return new URL(item.link_url!).hostname.replace("www.", ""); } catch { return item.link_url; }
  })();

  return (
    <div className="group relative rounded-xl border bg-card p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Link2 className="h-4 w-4" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={item.link_url!} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
          </a>
          {canDelete && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete} disabled={isPending}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{item.title || hostname}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{hostname}</p>
        {item.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.notes}</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-auto">Added by {item.added_by_name}</p>
    </div>
  );
}

export function MoodBoardGrid({
  items,
  rooms,
  projectId,
  canDelete,
}: {
  items: Item[];
  rooms: { id: string; name: string }[];
  projectId: string;
  canDelete: boolean;
}) {
  const [roomFilter, setRoomFilter] = useState<string>("all");

  const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));

  const filtered = roomFilter === "all" ? items : items.filter(i =>
    roomFilter === "general" ? !i.room_id : i.room_id === roomFilter
  );

  // Group by room for display
  const groups: { label: string; items: Item[] }[] = [];
  if (roomFilter === "all") {
    const byRoom: Record<string, Item[]> = {};
    for (const item of items) {
      const key = item.room_id ?? "__general__";
      if (!byRoom[key]) byRoom[key] = [];
      byRoom[key].push(item);
    }
    if (byRoom["__general__"]?.length) groups.push({ label: "General", items: byRoom["__general__"] });
    for (const room of rooms) {
      if (byRoom[room.id]?.length) groups.push({ label: room.name, items: byRoom[room.id] });
    }
  } else {
    groups.push({ label: "", items: filtered });
  }

  return (
    <div className="space-y-8">
      {/* Room filter pills */}
      {rooms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["all", "general", ...rooms.map(r => r.id)].map(key => (
            <button
              key={key}
              onClick={() => setRoomFilter(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                roomFilter === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground hover:text-foreground border-border hover:border-foreground/30"
              }`}
            >
              {key === "all" ? "All" : key === "general" ? "General" : roomMap[key]}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed rounded-xl">
          <p className="font-medium text-muted-foreground">No inspiration added yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Add images or links to build the mood board.</p>
        </div>
      )}

      {groups.map(({ label, items: groupItems }) => (
        <div key={label} className="space-y-4">
          {label && <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</h3>}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {groupItems.map(item =>
              item.type === "image" ? (
                <ImageCard key={item.id} item={item} canDelete={canDelete} projectId={projectId} />
              ) : (
                <LinkCard key={item.id} item={item} canDelete={canDelete} projectId={projectId} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
