"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type GalleryImage = { id: string; url: string; alt: string; category: string };

export function Gallery({ images, heroImageUrl }: { images: GalleryImage[]; heroImageUrl: string | null }) {
  const t = useTranslations("modelDetail");
  const categories = [...new Set(images.map((i) => i.category))];
  const [tab, setTab] = useState<string>(categories[0] ?? "exterior");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = images.filter((i) => i.category === tab);
  const main = visible[0] ?? (heroImageUrl ? { id: "hero", url: heroImageUrl, alt: "", category: tab } : undefined);

  function openLightbox(id: string) {
    const idx = visible.findIndex((i) => i.id === id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  }

  return (
    <div className="space-y-3">
      {categories.length > 1 && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {categories.map((c) => (
              <TabsTrigger key={c} value={c} className="capitalize">
                {c === "exterior" ? t("exterior") : c === "interior" ? t("interior") : c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {main && (
        <button
          type="button"
          onClick={() => openLightbox(main.id)}
          className="relative block aspect-video w-full overflow-hidden rounded-xl bg-muted"
        >
          <Image src={main.url} alt={main.alt} fill priority sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" />
        </button>
      )}

      {visible.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {visible.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => openLightbox(img.id)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-md bg-muted ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-primary",
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent showCloseButton={false} className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{main?.alt ?? "Vehicle image"}</DialogTitle>
          {lightboxIndex !== null && visible[lightboxIndex] && (
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                <Image src={visible[lightboxIndex].url} alt={visible[lightboxIndex].alt} fill sizes="90vw" className="object-contain" />
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-3 -end-3 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              {visible.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + visible.length) % visible.length))}
                    className="absolute start-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % visible.length))}
                    className="absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
