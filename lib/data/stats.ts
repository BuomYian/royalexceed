import { prisma } from "@/lib/prisma";

export type SiteStats = {
  /** Published models in the public range. */
  modelCount: number;
  /** Units physically available or already in transit to Juba. */
  unitsInStock: number;
};

/**
 * Live counts for the homepage stats band. Deliberately only real,
 * verifiable numbers straight out of the CMS — the band's other two figures
 * (countries served, genuine-parts share) are constants stated elsewhere in
 * the site copy, not invented marketing metrics.
 */
export async function getSiteStats(): Promise<SiteStats> {
  const [modelCount, unitsInStock] = await Promise.all([
    prisma.model.count({ where: { status: "PUBLISHED" } }),
    prisma.inventoryUnit.count({ where: { status: { in: ["AVAILABLE", "IN_TRANSIT"] } } }),
  ]);

  return { modelCount, unitsInStock };
}
