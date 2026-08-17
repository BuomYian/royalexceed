import { describe, expect, it } from "vitest";
import { convertPrice, formatMoney } from "@/lib/currency";

describe("currency", () => {
  it("returns USD rounded to 2dp", () => {
    expect(convertPrice(20500, 1300, "USD")).toBe(20500);
    expect(convertPrice("20500.005", 1300, "USD")).toBeCloseTo(20500.01, 2);
  });

  it("converts USD to SSP using the given rate, rounded to whole units", () => {
    expect(convertPrice(100, 1300, "SSP")).toBe(130000);
    expect(convertPrice(100.5, 1300.25, "SSP")).toBe(Math.round(100.5 * 1300.25));
  });

  it("returns null for missing amounts (price on request)", () => {
    expect(convertPrice(null, 1300, "USD")).toBeNull();
    expect(convertPrice(undefined, 1300, "USD")).toBeNull();
  });

  it("formats money with the correct currency code", () => {
    expect(formatMoney(20500, "USD")).toContain("20,500");
    expect(formatMoney(1300000, "SSP")).toContain("SSP");
  });
});
