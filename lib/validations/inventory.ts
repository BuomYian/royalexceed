import { z } from "zod";
import { optionalNumber } from "./common";

export const conditionSchema = z.enum(["NEW", "CERTIFIED_PRE_OWNED", "USED"]);
export const stockStatusSchema = z.enum(["IN_TRANSIT", "AVAILABLE", "RESERVED", "SOLD"]);

export const inventoryInputSchema = z.object({
  id: z.string().optional(),
  stockNumber: z.string().trim().min(1, "Stock number is required"),
  vin: z.string().trim().max(17).optional().nullable(),
  modelId: z.string().min(1, "Model is required"),
  variantId: z.string().optional().nullable(),
  year: z.coerce.number().int().min(2000).max(2100),
  colorName: z.string().trim().min(1, "Color is required"),
  mileageKm: optionalNumber(z.number().int().min(0)).default(0),
  condition: conditionSchema.default("NEW"),
  status: stockStatusSchema.default("IN_TRANSIT"),
  priceUsd: optionalNumber(z.number().positive()).nullable(),
  arrivalDate: z.string().optional().nullable(),
  notes: z.string().trim().max(2000).optional(),
  images: z
    .array(z.object({ id: z.string().optional(), url: z.string(), alt: z.string().optional() }))
    .default([]),
});
export type InventoryInput = z.infer<typeof inventoryInputSchema>;

export const inventoryFilterSchema = z.object({
  modelId: z.string().optional(),
  status: stockStatusSchema.optional(),
  condition: conditionSchema.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});
export type InventoryFilterInput = z.infer<typeof inventoryFilterSchema>;

/** CSV bulk-import row schema (see README "Inventory CSV import" for the column list). */
export const inventoryCsvRowSchema = z.object({
  stockNumber: z.string().trim().min(1),
  vin: z.string().trim().optional(),
  modelSlug: z.string().trim().min(1),
  variantName: z.string().trim().optional(),
  year: z.coerce.number().int().min(2000).max(2100),
  colorName: z.string().trim().min(1),
  mileageKm: z.coerce.number().int().min(0).default(0),
  condition: conditionSchema.default("NEW"),
  status: stockStatusSchema.default("IN_TRANSIT"),
  priceUsd: z.coerce.number().positive().optional(),
  arrivalDate: z.string().optional(),
});
export type InventoryCsvRow = z.infer<typeof inventoryCsvRowSchema>;
export const INVENTORY_CSV_COLUMNS = [
  "stockNumber",
  "vin",
  "modelSlug",
  "variantName",
  "year",
  "colorName",
  "mileageKm",
  "condition",
  "status",
  "priceUsd",
  "arrivalDate",
] as const;
