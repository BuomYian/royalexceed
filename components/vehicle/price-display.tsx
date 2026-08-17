"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { convertPrice, formatMoney, type Money } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  usdAmount,
  usdToSsp,
  priceOnRequest,
  size = "md",
  className,
}: {
  usdAmount: Money;
  usdToSsp: number;
  priceOnRequest?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const t = useTranslations("common");
  const tPrice = useTranslations("price");
  const [currency, setCurrency] = useState<"USD" | "SSP">("USD");

  if (priceOnRequest || usdAmount === null || usdAmount === undefined) {
    return <span className={cn("font-heading font-bold", className)}>{t("priceOnRequest")}</span>;
  }

  const converted = convertPrice(usdAmount, usdToSsp, currency);
  const sizeClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-heading font-bold", sizeClass)}>
        {converted !== null && formatMoney(converted, currency)}
      </span>
      <button
        type="button"
        onClick={() => setCurrency((c) => (c === "USD" ? "SSP" : "USD"))}
        className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        {currency === "USD" ? tPrice("ssp") : tPrice("usd")}
      </button>
    </div>
  );
}
