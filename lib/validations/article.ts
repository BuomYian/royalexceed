import { z } from "zod";
import { publishStatusSchema } from "./model";

export const articleInputSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens")
    .optional(),
  title: z.string().trim().min(1, "Title is required").max(150),
  excerpt: z.string().trim().max(300).optional(),
  body: z.string().trim().min(1, "Body is required"),
  coverImageUrl: z.string().optional().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
  status: publishStatusSchema.default("DRAFT"),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(160).optional(),
});
export type ArticleInput = z.infer<typeof articleInputSchema>;
