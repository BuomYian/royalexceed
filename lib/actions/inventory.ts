"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  inventoryInputSchema,
  inventoryCsvRowSchema,
  type InventoryInput,
} from "@/lib/validations/inventory";
import type { ActionResult } from "@/lib/actions/models";

export async function createInventoryUnit(raw: InventoryInput): Promise<ActionResult<{ id: string }>> {
  const user = await requireApiAccess("inventory", "create");
  const parsed = inventoryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const input = parsed.data;

  const dupe = await prisma.inventoryUnit.findUnique({ where: { stockNumber: input.stockNumber } });
  if (dupe) return { success: false, error: "Stock number already exists" };

  const unit = await prisma.inventoryUnit.create({
    data: {
      stockNumber: input.stockNumber,
      vin: input.vin || null,
      modelId: input.modelId,
      variantId: input.variantId || null,
      year: input.year,
      colorName: input.colorName,
      mileageKm: input.mileageKm,
      condition: input.condition,
      status: input.status,
      priceUsd: input.priceUsd,
      arrivalDate: input.arrivalDate ? new Date(input.arrivalDate) : null,
      notes: input.notes,
      images: { create: input.images.map(({ id: _id, ...rest }) => rest) },
    },
  });

  await writeAuditLog({ actorId: user.id, action: "CREATE", entity: "InventoryUnit", entityId: unit.id });
  revalidatePath("/admin/inventory");
  revalidatePath("/inventory");
  revalidatePath("/"); // home page's Featured Inventory Strip
  return { success: true, data: { id: unit.id } };
}

export async function updateInventoryUnit(raw: InventoryInput): Promise<ActionResult<{ id: string }>> {
  const user = await requireApiAccess("inventory", "update");
  if (!raw.id) return { success: false, error: "Missing id" };
  const parsed = inventoryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const input = parsed.data;

  const existing = await prisma.inventoryUnit.findUnique({ where: { id: raw.id } });
  if (!existing) return { success: false, error: "Not found" };

  await prisma.inventoryUnit.update({
    where: { id: raw.id },
    data: {
      stockNumber: input.stockNumber,
      vin: input.vin || null,
      modelId: input.modelId,
      variantId: input.variantId || null,
      year: input.year,
      colorName: input.colorName,
      mileageKm: input.mileageKm,
      condition: input.condition,
      status: input.status,
      priceUsd: input.priceUsd,
      arrivalDate: input.arrivalDate ? new Date(input.arrivalDate) : null,
      soldAt: input.status === "SOLD" && existing.status !== "SOLD" ? new Date() : undefined,
      notes: input.notes,
    },
  });

  const existingImages = await prisma.inventoryImage.findMany({ where: { unitId: raw.id } });
  const keepImageIds = new Set(input.images.filter((i) => i.id && !i.id.startsWith("tmp-")).map((i) => i.id));
  const imagesToDelete = existingImages.filter((img) => !keepImageIds.has(img.id));
  if (imagesToDelete.length) {
    await prisma.inventoryImage.deleteMany({ where: { id: { in: imagesToDelete.map((i) => i.id) } } });
  }
  for (const [index, image] of input.images.entries()) {
    if (image.id && !image.id.startsWith("tmp-")) {
      await prisma.inventoryImage.update({ where: { id: image.id }, data: { url: image.url, alt: image.alt, sortOrder: index } });
    } else {
      await prisma.inventoryImage.create({ data: { unitId: raw.id, url: image.url, alt: image.alt, sortOrder: index } });
    }
  }

  if (existing.status !== input.status) {
    await writeAuditLog({
      actorId: user.id,
      action: "STATUS_CHANGE",
      entity: "InventoryUnit",
      entityId: raw.id,
      changes: { from: existing.status, to: input.status },
    });
  }
  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "InventoryUnit", entityId: raw.id });

  revalidatePath("/admin/inventory");
  revalidatePath("/inventory");
  revalidatePath("/"); // home page's Featured Inventory Strip — was missing, which is why edited
  // photos (and any other field) showed up on /inventory but never on the home page.
  revalidatePath(`/inventory/${input.stockNumber}`);
  return { success: true, data: { id: raw.id } };
}

export async function deleteInventoryUnit(id: string): Promise<ActionResult> {
  const user = await requireApiAccess("inventory", "delete");
  await prisma.inventoryUnit.delete({ where: { id } });
  await writeAuditLog({ actorId: user.id, action: "DELETE", entity: "InventoryUnit", entityId: id });
  revalidatePath("/admin/inventory");
  revalidatePath("/inventory");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function bulkImportInventory(
  rows: unknown[],
): Promise<ActionResult<{ imported: number; errors: { row: number; message: string }[] }>> {
  const user = await requireApiAccess("inventory", "create");

  const errors: { row: number; message: string }[] = [];
  const validRows: Array<ReturnType<typeof inventoryCsvRowSchema.parse>> = [];

  rows.forEach((row, index) => {
    const parsed = inventoryCsvRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push({ row: index + 1, message: parsed.error.issues.map((i) => i.message).join("; ") });
    } else {
      validRows.push(parsed.data);
    }
  });

  if (errors.length > 0) {
    return { success: false, error: "Some rows failed validation", fieldErrors: undefined };
  }

  const modelSlugs = [...new Set(validRows.map((r) => r.modelSlug))];
  const models = await prisma.model.findMany({
    where: { slug: { in: modelSlugs } },
    include: { variants: true },
  });
  const modelBySlug = new Map(models.map((m) => [m.slug, m]));

  let imported = 0;
  await prisma.$transaction(async (tx) => {
    for (const row of validRows) {
      const model = modelBySlug.get(row.modelSlug);
      if (!model) {
        errors.push({ row: imported + 1, message: `Unknown model slug: ${row.modelSlug}` });
        continue;
      }
      const variant = row.variantName ? model.variants.find((v) => v.name === row.variantName) : undefined;
      await tx.inventoryUnit.upsert({
        where: { stockNumber: row.stockNumber },
        update: {
          modelId: model.id,
          variantId: variant?.id,
          year: row.year,
          colorName: row.colorName,
          mileageKm: row.mileageKm,
          condition: row.condition,
          status: row.status,
          priceUsd: row.priceUsd,
          arrivalDate: row.arrivalDate ? new Date(row.arrivalDate) : undefined,
          vin: row.vin || undefined,
        },
        create: {
          stockNumber: row.stockNumber,
          vin: row.vin || null,
          modelId: model.id,
          variantId: variant?.id,
          year: row.year,
          colorName: row.colorName,
          mileageKm: row.mileageKm,
          condition: row.condition,
          status: row.status,
          priceUsd: row.priceUsd,
          arrivalDate: row.arrivalDate ? new Date(row.arrivalDate) : null,
        },
      });
      imported += 1;
    }
  });

  await writeAuditLog({ actorId: user.id, action: "CREATE", entity: "InventoryUnit", changes: { bulkImport: imported } });
  revalidatePath("/admin/inventory");
  revalidatePath("/inventory");
  revalidatePath("/");
  return { success: true, data: { imported, errors } };
}
