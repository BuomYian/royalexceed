import type { BodyType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ModelFilterInput } from "@/lib/validations/model";

/** Lightweight model list for <select> pickers across admin forms and public filters. */
export async function listModelOptions() {
  return prisma.model.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, displayName: true, variants: { select: { id: true, name: true } } },
  });
}

const publishedWhere = { status: "PUBLISHED" as const };

// Card-grid list queries (home, /models, related models) select both image
// fields and fall back to heroImageUrl when thumbnailUrl is unset — the admin
// model form didn't expose a thumbnail uploader until this field existed, so
// older/existing models may only have a hero image. New models get both set
// explicitly going forward, but this keeps already-published ones from
// rendering a blank card in the meantime.
function withThumbnailFallback<T extends { thumbnailUrl: string | null; heroImageUrl: string | null }>(
  model: T,
): Omit<T, "heroImageUrl"> {
  const { heroImageUrl, ...rest } = model;
  return { ...rest, thumbnailUrl: model.thumbnailUrl ?? heroImageUrl };
}

const cardSelect = {
  slug: true,
  displayName: true,
  tagline: true,
  bodyType: true,
  seats: true,
  startingPriceUsd: true,
  priceOnRequest: true,
  thumbnailUrl: true,
  heroImageUrl: true,
} as const;

export async function getFeaturedModels(limit = 6) {
  const models = await prisma.model.findMany({
    where: { ...publishedWhere, isFeatured: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
    select: cardSelect,
  });
  return models.map(withThumbnailFallback);
}

export async function getPublishedModels(filters: Partial<ModelFilterInput> = {}) {
  const where: Prisma.ModelWhereInput = { ...publishedWhere };
  if (filters.bodyType) where.bodyType = filters.bodyType;
  if (filters.seats) where.seats = filters.seats;
  if (filters.minPrice || filters.maxPrice) {
    where.startingPriceUsd = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.fuelType || filters.transmission) {
    where.variants = {
      some: {
        ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
        ...(filters.transmission ? { transmission: filters.transmission } : {}),
      },
    };
  }

  const orderBy: Prisma.ModelOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { startingPriceUsd: "asc" }
      : filters.sort === "price-desc"
        ? { startingPriceUsd: "desc" }
        : { createdAt: "desc" };

  const models = await prisma.model.findMany({
    where,
    orderBy,
    select: cardSelect,
  });
  return models.map(withThumbnailFallback);
}

export async function getModelBySlug(slug: string) {
  return prisma.model.findFirst({
    where: { slug, ...publishedWhere },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      specGroups: { orderBy: { sortOrder: "asc" }, include: { specs: { orderBy: { sortOrder: "asc" } } } },
      features: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedModels(currentSlug: string, bodyType: BodyType, limit = 3) {
  const models = await prisma.model.findMany({
    where: { ...publishedWhere, bodyType, slug: { not: currentSlug } },
    take: limit,
    select: cardSelect,
  });
  return models.map(withThumbnailFallback);
}

export async function getModelsForCompare(slugs: string[]) {
  return prisma.model.findMany({
    where: { slug: { in: slugs }, ...publishedWhere },
    include: { specGroups: { orderBy: { sortOrder: "asc" }, include: { specs: true } } },
  });
}

export async function incrementModelViewCount(slug: string) {
  await prisma.model.updateMany({ where: { slug }, data: { viewCount: { increment: 1 } } });
}
