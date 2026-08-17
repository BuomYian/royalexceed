import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_PATHS = [
  "",
  "/models",
  "/compare",
  "/inventory",
  "/test-drive",
  "/services",
  "/parts",
  "/finance",
  "/about",
  "/news",
  "/contact",
  "/privacy",
  "/terms",
];

function localizedEntry(path: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ?? new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}${path}`,
        ]),
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [models, inventory, articles] = await Promise.all([
    prisma.model.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.inventoryUnit.findMany({ select: { stockNumber: true, updatedAt: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...STATIC_PATHS.map((path) => localizedEntry(path)),
    ...models.map((m) => localizedEntry(`/models/${m.slug}`, m.updatedAt)),
    ...inventory.map((u) => localizedEntry(`/inventory/${u.stockNumber}`, u.updatedAt)),
    ...articles.map((a) => localizedEntry(`/news/${a.slug}`, a.updatedAt)),
  ];
}
