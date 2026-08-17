"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadMediaAction } from "@/lib/actions/media";
import type { MediaFolder } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Client-side compresses images before upload (spec §7 "Image upload with
 * client-side compression before hitting Storage"), then posts to the
 * server-side `uploadMediaAction`, which uploads to Cloudinary (MIME/size
 * validated; EXIF stripped by Cloudinary by default on upload).
 */
export function ImageUploader({
  folder,
  value,
  onChange,
  label = "Upload image",
  aspectHint,
}: {
  folder: MediaFolder;
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspectHint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(value ?? null);

  async function handleFile(file: File) {
    let toUpload = file;
    try {
      if (folder !== "documents") {
        const imageCompression = (await import("browser-image-compression")).default;
        toUpload = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 2000,
          useWebWorker: true,
        });
      }
    } catch {
      // Compression is a best-effort optimization — fall back to the original file.
    }

    const formData = new FormData();
    formData.set("file", toUpload, file.name);

    startTransition(async () => {
      const result = await uploadMediaAction(folder, formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPreview(result.data.url);
      onChange(result.data.url);
      toast.success("Image uploaded");
    });
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={folder === "documents" ? "application/pdf" : "image/png,image/jpeg,image/webp,image/avif"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {preview ? (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
          {folder === "documents" ? (
            <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
              PDF uploaded
            </div>
          ) : (
            <Image src={preview} alt="" fill className="object-cover" unoptimized />
          )}
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute end-2 top-2 h-7 w-7"
            onClick={() => {
              setPreview(null);
              onChange(null);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary",
          )}
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {pending ? "Uploading…" : label}
          {aspectHint && <span className="text-xs">{aspectHint}</span>}
        </button>
      )}
    </div>
  );
}
