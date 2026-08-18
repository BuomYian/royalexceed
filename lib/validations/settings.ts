import { z } from "zod";

export const openingHoursSchema = z.object({
  monFri: z.string().min(1),
  saturday: z.string().min(1),
  sunday: z.string().min(1),
});

export const socialsSchema = z.object({
  facebook: z.string().url().or(z.literal("")).optional(),
  instagram: z.string().url().or(z.literal("")).optional(),
  tiktok: z.string().url().or(z.literal("")).optional(),
  x: z.string().url().or(z.literal("")).optional(),
});

export const heroSlideSchema = z.object({
  id: z.string(),
  modelSlug: z.string().optional(),
  imageUrl: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().optional(),
});

export const departmentContactSchema = z.object({
  label: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

export const siteSettingsDataSchema = z.object({
  companyName: z.string().default("Exceed Limited"),
  phone: z.string(),
  whatsappNumber: z.string(), // digits-only intl format for wa.me, e.g. "211912345678"
  email: z.string().email(),
  address: z.object({
    line: z.string(),
    city: z.string().default("Juba"),
    country: z.string().default("South Sudan"),
    lat: z.number(),
    lng: z.number(),
    mapUrl: z.string().optional(),
  }),
  hours: openingHoursSchema,
  socials: socialsSchema.default({}),
  heroSlides: z.array(heroSlideSchema).default([]),
  departments: z
    .object({
      sales: departmentContactSchema,
      service: departmentContactSchema,
      parts: departmentContactSchema,
      fleet: departmentContactSchema,
    })
    .optional(),
  seoDefaults: z
    .object({
      title: z.string(),
      description: z.string(),
      ogImageUrl: z.string().optional(),
    })
    .optional(),
  maintenanceMode: z.boolean().default(false),
  googleBusinessProfileUrl: z.string().optional(),
});

export type SiteSettingsData = z.infer<typeof siteSettingsDataSchema>;

// Site currency is USD only — no exchange-rate field needed, so this is just
// an alias kept for call-site clarity (admin settings form vs. public reads).
export const updateSiteSettingsSchema = siteSettingsDataSchema;

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
