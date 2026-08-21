"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const BODY_TYPES = ["SUV", "CROSSOVER", "SEDAN", "HATCHBACK", "PICKUP", "MPV", "VAN"];
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"];
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "DCT", "CVT"];

export function ModelsFilterBar() {
  const t = useTranslations("models");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = ["bodyType", "fuelType", "seats", "transmission"].some((k) => searchParams.get(k));

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <Select value={searchParams.get("bodyType") ?? "all"} onValueChange={(v) => setParam("bodyType", !v || v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder={t("filterBodyType")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allBodyTypes")}</SelectItem>
          {BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("fuelType") ?? "all"} onValueChange={(v) => setParam("fuelType", !v || v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder={t("filterFuelType")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterFuelType")}</SelectItem>
          {FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f.replace("_", " ")}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("transmission") ?? "all"} onValueChange={(v) => setParam("transmission", !v || v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder={t("filterTransmission")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterTransmission")}</SelectItem>
          {TRANSMISSIONS.map((tr) => <SelectItem key={tr} value={tr}>{tr}</SelectItem>)}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          <X className="h-3.5 w-3.5" /> {t("clearFilters")}
        </Button>
      )}
    </div>
  );
}
