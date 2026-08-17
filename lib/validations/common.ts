import { z } from "zod";

/** Loose intl phone validator — must accommodate +211 South Sudan numbers as well as staff entering other formats. */
export const phoneSchema = z
  .string()
  .trim()
  .min(7, "forms.invalidPhone")
  .max(20, "forms.invalidPhone")
  .regex(/^\+?[0-9\s-]{7,20}$/, "forms.invalidPhone");

export const emailSchema = z.string().trim().email("forms.invalidEmail");
export const optionalEmailSchema = z
  .union([emailSchema, z.literal("")])
  .optional()
  .transform((v) => (v ? v : undefined));

export const consentSchema = z.literal(true, {
  message: "forms.consentRequired",
});

/** Must stay empty — a bot filling it flags the submission as spam server-side (spec §9). */
export const honeypotSchema = z.string().max(0).optional().or(z.literal(""));

export const turnstileTokenSchema = z.string().optional();

export const baseLeadFieldsSchema = z.object({
  fullName: z.string().trim().min(2, "forms.requiredField").max(120),
  phone: phoneSchema,
  email: optionalEmailSchema,
  consent: consentSchema,
  honeypot: honeypotSchema,
  turnstileToken: turnstileTokenSchema,
  pageUrl: z.string().optional(),
  source: z.string().optional(),
});
