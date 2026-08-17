"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type ModelColorOption = { id: string; name: string; hexCode: string; imageUrl: string | null };

export function ColorSwitcher({
  colors,
  fallbackImageUrl,
  fallbackAlt,
}: {
  colors: ModelColorOption[];
  fallbackImageUrl: string | null;
  fallbackAlt: string;
}) {
  const t = useTranslations("modelDetail");
  const [selected, setSelected] = useState(colors[0]);
  const image = selected?.imageUrl ?? fallbackImageUrl;

  if (colors.length === 0) return null;

  return (
    <div className="space-y-3">
      {image && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
          <Image src={image} alt={selected?.name ?? fallbackAlt} fill sizes="(max-width: 1024px) 100vw, 800px" className="object-cover transition-opacity" />
        </div>
      )}
      <div>
        <p className="mb-2 text-sm font-medium">
          {t("colors")}: <span className="text-muted-foreground">{selected?.name}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => setSelected(color)}
              aria-label={color.name}
              aria-pressed={selected?.id === color.id}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-transform hover:scale-110",
                selected?.id === color.id ? "border-primary" : "border-border",
              )}
              style={{ backgroundColor: color.hexCode }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
