import { z } from "zod";

export const bodyTypeSchema = z.enum([
  "SUV",
  "CROSSOVER",
  "SEDAN",
  "HATCHBACK",
  "PICKUP",
  "MPV",
  "VAN",
]);
export const fuelTypeSchema = z.enum([
  "PETROL",
  "DIESEL",
  "HYBRID",
  "PLUGIN_HYBRID",
  "ELECTRIC",
]);
export const transmissionSchema = z.enum(["MANUAL", "AUTOMATIC", "DCT", "CVT"]);
export const drivetrainSchema = z.enum(["FWD", "RWD", "AWD", "FOUR_WD"]);
export const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const variantInputSchema = z.object({
  id: z.string().optional(), // present = update, absent = create
  name: z.string().trim().min(1, "Variant name is required"),
  priceUsd: z.coerce.number().positive().optional().nullable(),
  engine: z.string().trim().optional(),
  powerHp: z.coerce.number().int().positive().optional().nullable(),
  torqueNm: z.coerce.number().int().positive().optional().nullable(),
  fuelType: fuelTypeSchema,
  transmission: transmissionSchema,
  drivetrain: drivetrainSchema,
  sortOrder: z.coerce.number().int().default(0),
});

export const colorInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Color name is required"),
  hexCode: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, "Enter a valid hex color"),
  imageUrl: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export const imageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1),
  alt: z.string().trim().min(1, "Alt text is required for every image"),
  category: z.enum(["exterior", "interior", "detail"]).default("exterior"),
  sortOrder: z.coerce.number().int().default(0),
});

export const specItemInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Label is required"),
  value: z.string().trim().min(1, "Value is required"),
  unit: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const specGroupInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Group title is required"),
  sortOrder: z.coerce.number().int().default(0),
  specs: z.array(specItemInputSchema).default([]),
});

export const featureBlockInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  imageUrl: z.string().optional().nullable(),
  layout: z.enum(["image-right", "image-left", "full-bleed"]).default("image-right"),
  sortOrder: z.coerce.number().int().default(0),
});

export const modelInputSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens")
    .optional(), // auto-generated from name if omitted
  name: z.string().trim().min(1, "Name is required").max(50),
  displayName: z.string().trim().min(1, "Display name is required").max(100),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().min(1, "Description is required"),
  bodyType: bodyTypeSchema,
  seats: z.coerce.number().int().min(1).max(23),
  startingPriceUsd: z.coerce.number().positive().optional().nullable(),
  priceOnRequest: z.boolean().default(false),
  year: z.coerce.number().int().min(2000).max(2100),
  heroImageUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  brochureUrl: z.string().optional().nullable(),
  status: publishStatusSchema.default("DRAFT"),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  ogImageUrl: z.string().optional().nullable(),

  variants: z.array(variantInputSchema).default([]),
  colors: z.array(colorInputSchema).default([]),
  images: z.array(imageInputSchema).default([]),
  specGroups: z.array(specGroupInputSchema).default([]),
  features: z.array(featureBlockInputSchema).default([]),
});
export type ModelInput = z.infer<typeof modelInputSchema>;

export const modelFilterSchema = z.object({
  bodyType: bodyTypeSchema.optional(),
  fuelType: fuelTypeSchema.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  seats: z.coerce.number().int().optional(),
  transmission: transmissionSchema.optional(),
  sort: z.enum(["price-asc", "price-desc", "newest"]).default("newest"),
});
export type ModelFilterInput = z.infer<typeof modelFilterSchema>;
