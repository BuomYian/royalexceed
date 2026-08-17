"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const BODY_TYPES = ["SUV", "CROSSOVER", "SEDAN", "HATCHBACK", "PICKUP", "MPV", "VAN"];
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "PLUGIN_HYBRID", "ELECTRIC"];
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "DCT", "CVT"];
const PRICE_BANDS = [
  { label: "Under $25,000", min: undefined, max: 25000 },
  { label: "$25,000 – $35,000", min: 25000, max: 35000 },
  { label: "Over $35,000", min: 35000, max: undefined },
];

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

  const hasFilters = ["bodyType", "fuelType", "minPrice", "maxPrice", "seats", "transmission"].some((k) => searchParams.get(k));

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <Select value={searchParams.get("bodyType") ?? "all"} onValueChange={(v) => setParam("bodyType", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder={t("filterBodyType")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allBodyTypes")}</SelectItem>
          {BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("fuelType") ?? "all"} onValueChange={(v) => setParam("fuelType", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder={t("filterFuelType")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterFuelType")}</SelectItem>
          {FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f.replace("_", " ")}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("minPrice") ? `${searchParams.get("minPrice")}-${searchParams.get("maxPrice")}` : "all"}
        onValueChange={(v) => {
          if (v === "all") {
            setParam("minPrice", undefined);
            setParam("maxPrice", undefined);
            return;
          }
          const band = PRICE_BANDS.find((b) => `${b.min}-${b.max}` === v);
          const params = new URLSearchParams(searchParams.toString());
          if (band?.min) params.set("minPrice", String(band.min)); else params.delete("minPrice");
          if (band?.max) params.set("maxPrice", String(band.max)); else params.delete("maxPrice");
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        <SelectTrigger className="w-48"><SelectValue placeholder={t("filterPrice")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterPrice")}</SelectItem>
          {PRICE_BANDS.map((b) => <SelectItem key={b.label} value={`${b.min}-${b.max}`}>{b.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("transmission") ?? "all"} onValueChange={(v) => setParam("transmission", v === "all" ? undefined : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder={t("filterTransmission")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filterTransmission")}</SelectItem>
          {TRANSMISSIONS.map((tr) => <SelectItem key={tr} value={tr}>{tr}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("sort") ?? "newest"} onValueChange={(v) => setParam("sort", v)}>
        <SelectTrigger className="w-44"><SelectValue placeholder={t("sortBy")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("sortNewest")}</SelectItem>
          <SelectItem value="price-asc">{t("sortPriceAsc")}</SelectItem>
          <SelectItem value="price-desc">{t("sortPriceDesc")}</SelectItem>
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
