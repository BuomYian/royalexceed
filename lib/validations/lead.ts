import { z } from "zod";
import { baseLeadFieldsSchema } from "./common";

export const leadTypeSchema = z.enum([
  "GENERAL",
  "QUOTE",
  "TEST_DRIVE",
  "SERVICE",
  "PARTS",
  "FINANCE",
  "FLEET",
  "CALLBACK",
]);

export const generalLeadSchema = baseLeadFieldsSchema.extend({
  type: z.literal("GENERAL").default("GENERAL"),
  message: z.string().trim().min(1, "forms.requiredField").max(2000),
  department: z.enum(["sales", "service", "parts", "fleet", "general"]).default("general"),
});
export type GeneralLeadInput = z.infer<typeof generalLeadSchema>;

export const quoteLeadSchema = baseLeadFieldsSchema.extend({
  type: z.literal("QUOTE").default("QUOTE"),
  modelId: z.string().min(1, "forms.requiredField"),
  message: z.string().trim().max(2000).optional(),
});
export type QuoteLeadInput = z.infer<typeof quoteLeadSchema>;

export const partsLeadSchema = baseLeadFieldsSchema.extend({
  type: z.literal("PARTS").default("PARTS"),
  partName: z.string().trim().min(1, "forms.requiredField").max(200),
  partNumber: z.string().trim().max(100).optional(),
  vin: z.string().trim().max(50).optional(),
  quantity: z.coerce.number().int().min(1).max(9999).default(1),
});
export type PartsLeadInput = z.infer<typeof partsLeadSchema>;

export const financeLeadSchema = baseLeadFieldsSchema.extend({
  type: z.literal("FINANCE").default("FINANCE"),
  message: z.string().trim().max(2000).optional(),
  isFleetEnquiry: z.boolean().default(false),
});
export type FinanceLeadInput = z.infer<typeof financeLeadSchema>;

export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

export const updateLeadSchema = z.object({
  id: z.string(),
  status: leadStatusSchema.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

export const addLeadNoteSchema = z.object({
  leadId: z.string(),
  body: z.string().trim().min(1, "forms.requiredField").max(2000),
});
