import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { InventoryFilterInput } from "@/lib/validations/inventory";

export async function getFeaturedInventory(limit = 4) {
  return prisma.inventoryUnit.findMany({
    where: { status: { in: ["AVAILABLE", "IN_TRANSIT"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { model: { select: { slug: true, displayName: true } }, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

export async function getInventory(filters: Partial<InventoryFilterInput> = {}) {
  const where: Prisma.InventoryUnitWhereInput = {};
  if (filters.modelId) where.modelId = filters.modelId;
  if (filters.status) where.status = filters.status;
  if (filters.condition) where.condition = filters.condition;
  if (filters.minPrice || filters.maxPrice) {
    where.priceUsd = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }

  return prisma.inventoryUnit.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { model: { select: { slug: true, displayName: true } }, images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getInventoryByStockNumber(stockNumber: string) {
  return prisma.inventoryUnit.findUnique({
    where: { stockNumber },
    include: {
      model: true,
      variant: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}
