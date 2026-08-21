import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Public-site pricing is quote-only by business decision — no model or
 * inventory price is ever shown to visitors, regardless of whether one is
 * actually set (`usdAmount`/`priceOnRequest` are accepted for backwards
 * compatibility with existing call sites but are intentionally unused).
 * Real prices remain fully visible in the admin CMS — see components/admin/*
 * — this restriction is public-site-only.
 */
export function PriceDisplay({
  size = "md",
  className,
}: {
  usdAmount?: unknown;
  priceOnRequest?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const t = useTranslations("common");
  const sizeClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";

  return <span className={cn("font-heading font-bold", sizeClass, className)}>{t("priceOnRequest")}</span>;
}
