import { describe, expect, it } from "vitest";
import { z } from "zod";
import { optionalNumber } from "@/lib/validations/common";

/**
 * Regression test for a real bug caught by the admin-create-publish-vehicle
 * E2E test: RHF's `register(name, { valueAsNumber: true })` turns an empty
 * <input type="number"> into `NaN`, and plain `z.coerce.number().optional()`
 * rejects `NaN` — silently blocking form submission client-side with no
 * server round trip to debug.
 */
describe("optionalNumber", () => {
  const schema = optionalNumber(z.number().positive());

  it("treats NaN (an empty number input via RHF valueAsNumber) as absent", () => {
    expect(schema.safeParse(NaN).success).toBe(true);
    expect(schema.safeParse(NaN).data).toBeUndefined();
  });

  it("treats an empty string as absent", () => {
    expect(schema.safeParse("").success).toBe(true);
    expect(schema.safeParse("").data).toBeUndefined();
  });

  it("still validates a real value", () => {
    expect(schema.safeParse(20500).success).toBe(true);
    expect(schema.safeParse(-5).success).toBe(false); // fails .positive()
  });

  it("leaves undefined as undefined", () => {
    expect(schema.safeParse(undefined).data).toBeUndefined();
  });
});
