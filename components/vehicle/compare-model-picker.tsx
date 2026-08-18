"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function CompareModelPicker({
  allModels,
  selectedSlugs,
}: {
  allModels: { slug: string; displayName: string }[];
  selectedSlugs: string[];
}) {
  const t = useTranslations("compare");
  const router = useRouter();
  const pathname = usePathname();

  function setSlot(index: number, slug: string) {
    const next = [...selectedSlugs];
    if (slug === "none") next.splice(index, 1);
    else next[index] = slug;
    router.push(`${pathname}?slugs=${next.filter(Boolean).join(",")}`);
  }

  const slots = [0, 1, 2];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {slots.map((index) => {
        const current = selectedSlugs[index];
        return (
          <div key={index} className="flex items-center gap-2">
            <Select value={current ?? "none"} onValueChange={(v) => setSlot(index, v ?? "none")}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("selectModel")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("selectModel")}</SelectItem>
                {allModels
                  .filter((m) => m.slug === current || !selectedSlugs.includes(m.slug))
                  .map((m) => (
                    <SelectItem key={m.slug} value={m.slug}>{m.displayName}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {current && (
              <Button variant="ghost" size="icon" onClick={() => setSlot(index, "none")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
