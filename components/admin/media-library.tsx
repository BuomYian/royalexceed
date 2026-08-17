"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Copy } from "lucide-react";
import { uploadMediaAction, deleteMediaAction } from "@/lib/actions/media";
import { MEDIA_FOLDERS, type MediaFolder } from "@/lib/media";
import type { MediaFile } from "@/lib/data/media";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MediaLibrary({ folder, files }: { folder: MediaFolder; files: MediaFile[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<MediaFile | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function upload(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadMediaAction(folder, formData);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Uploaded");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <Tabs value={folder} onValueChange={(v) => router.push(`${pathname}?folder=${v}`)}>
        <TabsList>
          {MEDIA_FOLDERS.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">{f}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-sm text-muted-foreground transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        <p>Drag and drop, or</p>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={folder === "documents" ? "application/pdf" : "image/*"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {files.map((file) => (
          <div key={file.publicId} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {folder === "documents" ? (
              <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">{file.publicId.split("/").pop()}</div>
            ) : (
              <Image src={file.url} alt="" fill className="object-cover" unoptimized />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7"
                onClick={() => {
                  navigator.clipboard.writeText(file.url);
                  toast.success("URL copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => setToDelete(file)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No files in this folder yet.</p>}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              Blocked automatically if it&apos;s still referenced by published content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                startTransition(async () => {
                  if (!toDelete) return;
                  const result = await deleteMediaAction(folder, toDelete.publicId, toDelete.url);
                  if (!result.success) toast.error(result.error);
                  else {
                    toast.success("Deleted");
                    router.refresh();
                  }
                  setToDelete(null);
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
