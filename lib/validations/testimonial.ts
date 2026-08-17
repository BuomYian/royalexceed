import { z } from "zod";

export const testimonialInputSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().trim().min(1, "Name is required").max(100),
  authorTitle: z.string().trim().max(100).optional(),
  company: z.string().trim().max(100).optional(),
  quote: z.string().trim().min(1, "Quote is required").max(1000),
  avatarUrl: z.string().optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  isApproved: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});
export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
