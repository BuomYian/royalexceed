import { useTranslations } from "next-intl";
import { toUsdAmount, formatMoney, type Money } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  usdAmount,
  priceOnRequest,
  size = "md",
  className,
}: {
  usdAmount: Money;
  priceOnRequest?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const t = useTranslations("common");

  const amount = priceOnRequest ? null : toUsdAmount(usdAmount);
  const sizeClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";

  if (amount === null) {
    return <span className={cn("font-heading font-bold", sizeClass, className)}>{t("priceOnRequest")}</span>;
  }

  return (
    <span className={cn("font-heading font-bold", sizeClass, className)}>{formatMoney(amount)}</span>
  );
}
