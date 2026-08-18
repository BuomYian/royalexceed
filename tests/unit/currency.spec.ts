import { describe, expect, it } from "vitest";
import { toUsdAmount, formatMoney, formatPrice } from "@/lib/currency";

describe("currency", () => {
  it("rounds a USD amount to 2dp", () => {
    expect(toUsdAmount(20500)).toBe(20500);
    expect(toUsdAmount("20500.005")).toBeCloseTo(20500.01, 2);
  });

  it("returns null for missing amounts (price on request)", () => {
    expect(toUsdAmount(null)).toBeNull();
    expect(toUsdAmount(undefined)).toBeNull();
  });

  it("formats money as USD", () => {
    expect(formatMoney(20500)).toContain("20,500");
    expect(formatMoney(20500)).toContain("$");
  });

  it("formatPrice formats a raw amount directly, or empty string when absent", () => {
    expect(formatPrice(20500)).toContain("20,500");
    expect(formatPrice(null)).toBe("");
    expect(formatPrice(undefined)).toBe("");
  });
});
