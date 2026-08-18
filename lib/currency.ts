import { Decimal } from "@prisma/client/runtime/library";

/** Accepts a Prisma Decimal, string, or number — never a Float in storage, but display math is fine as JS numbers. */
export type Money = Decimal | string | number | null | undefined;

function toNumber(value: Money): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value);
  return value.toNumber();
}

/** Site currency is USD only. Rounds to 2dp for display. */
export function toUsdAmount(value: Money): number | null {
  const usd = toNumber(value);
  if (usd === null) return null;
  return Math.round(usd * 100) / 100;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formats a raw USD amount (Decimal/string/number) directly, or "" if absent (price on request). */
export function formatPrice(usdAmount: Money): string {
  const amount = toUsdAmount(usdAmount);
  if (amount === null) return "";
  return formatMoney(amount);
}
