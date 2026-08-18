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

/**
 * Optional numeric form field. RHF's `register(name, { valueAsNumber: true })`
 * turns an empty <input type="number"> into `NaN` (not `undefined`), and
 * plain `z.coerce.number().optional()` rejects `NaN` outright — silently
 * blocking submission with no server round trip to debug. This normalizes
 * `NaN`/empty-string to `undefined` before the real number check runs.
 */
export function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess((val) => {
    if (val === "" || val === null) return undefined;
    if (typeof val === "number" && Number.isNaN(val)) return undefined;
    return val;
  }, schema.optional());
}

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
