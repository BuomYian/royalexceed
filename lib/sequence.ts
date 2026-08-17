import { prisma } from "@/lib/prisma";

/**
 * Atomic, race-safe reference number generator (e.g. "TD-2026-0143").
 * Backed by the `Sequence` table (an explicit, documented extension to the
 * spec's starting-point schema — see README).
 */
export async function nextReference(prefix: "TD" | "SV"): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;

  const seq = await prisma.$queryRaw<{ value: number }[]>`
    INSERT INTO "Sequence" (key, value)
    VALUES (${key}, 1)
    ON CONFLICT (key) DO UPDATE SET value = "Sequence".value + 1
    RETURNING value
  `;

  const value = seq[0]?.value ?? 1;
  return `${prefix}-${year}-${String(value).padStart(4, "0")}`;
}
