"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadMaterialImage } from "@/app/actions/materials";
import { toast } from "sonner";

interface MaterialImageUploadProps {
  materialId: string;
  projectId: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
}

export function MaterialImageUpload({ materialId, projectId, imageUrl, size = "md" }: MaterialImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("materialId", materialId);
        formData.append("projectId", projectId);
        formData.append("file", file);
        await uploadMaterialImage(formData);
        toast.success("Image uploaded");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload image");
      }
    });
  };

  const dimension = size === "sm" ? 48 : 96;

  return (
    <div
      className="relative cursor-pointer group"
      style={{ width: dimension, height: dimension }}
      onClick={() => !isPending && inputRef.current?.click()}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Material"
          fill
          unoptimized
          className="object-cover rounded-md border border-border"
        />
      ) : (
        <div className={`w-full h-full rounded-md border-2 border-dashed border-border flex items-center justify-center bg-secondary/30`}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Hover overlay on existing image */}
      {imageUrl && !isPending && (
        <div className="absolute inset-0 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ImagePlus className="h-4 w-4 text-white" />
        </div>
      )}

      {isPending && imageUrl && (
        <div className="absolute inset-0 rounded-md bg-black/40 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
