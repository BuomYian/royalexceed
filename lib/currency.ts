import { Decimal } from "@prisma/client/runtime/library";

export type CurrencyCode = "USD" | "SSP";

/** Accepts a Prisma Decimal, string, or number — never a Float in storage, but display math is fine as JS numbers. */
export type Money = Decimal | string | number | null | undefined;

function toNumber(value: Money): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value);
  return value.toNumber();
}

/** USD is shown to 2dp; SSP is shown as whole units (no fractional SSP in everyday use). */
export function convertPrice(
  usdAmount: Money,
  usdToSsp: number,
  currency: CurrencyCode,
): number | null {
  const usd = toNumber(usdAmount);
  if (usd === null) return null;
  if (currency === "USD") return Math.round(usd * 100) / 100;
  return Math.round(usd * usdToSsp);
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (currency === "SSP") {
    // Intl has no real symbol for SSP and silently substitutes an unrelated one
    // (observed: "£") depending on the JS engine's CLDR data, so SSP is
    // formatted manually rather than trusting Intl's currency resolution.
    return `SSP ${Math.round(amount).toLocaleString("en-US")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPrice(
  usdAmount: Money,
  usdToSsp: number,
  currency: CurrencyCode,
): string {
  const converted = convertPrice(usdAmount, usdToSsp, currency);
  if (converted === null) return "";
  return formatMoney(converted, currency);
}
