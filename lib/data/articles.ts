import { prisma } from "@/lib/prisma";

const publishedWhere = { status: "PUBLISHED" as const, publishedAt: { lte: new Date() } };

export async function getLatestArticles(limit = 3) {
  return prisma.article.findMany({
    where: publishedWhere,
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { slug: true, title: true, excerpt: true, coverImageUrl: true, publishedAt: true },
  });
}

export async function getAllArticles() {
  return prisma.article.findMany({
    where: publishedWhere,
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { fullName: true } } },
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, ...publishedWhere },
    include: { author: { select: { fullName: true } } },
  });
}
