import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  siteSettingsDataSchema,
  type SiteSettingsData,
} from "@/lib/validations/settings";

/**
 * REPLACE BEFORE GO-LIVE: these are placeholder business details used when no
 * SiteSetting row exists yet (fresh DB before the first seed/admin save) and as
 * the seed script's starting values. Real values (phone, email, hours, socials,
 * exact coordinates) were not provided in the spec — see README "Before go-live".
 */
export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  companyName: "FBM International",
  phone: "+211 92 000 0000",
  whatsappNumber: "211920000000",
  email: "info@fbminternational.com",
  address: {
    line: "Juba Town, near Muduria Roundabout",
    city: "Juba",
    country: "South Sudan",
    lat: 4.8517,
    lng: 31.5825,
    mapUrl: "https://www.google.com/maps?q=Muduria+Roundabout,Juba,South+Sudan",
  },
  hours: {
    monFri: "8:00 AM – 6:00 PM",
    saturday: "8:00 AM – 6:00 PM",
    sunday: "Closed",
  },
  socials: {
    facebook: "https://facebook.com/fbminternational",
    instagram: "https://instagram.com/fbminternational",
    tiktok: "https://tiktok.com/@fbminternational",
    x: "https://x.com/fbminternational",
  },
  heroSlides: [],
  departments: {
    sales: { label: "Sales", phone: "+211 92 000 0001", email: "sales@fbminternational.com" },
    service: { label: "Service", phone: "+211 92 000 0002", email: "service@fbminternational.com" },
    parts: { label: "Parts", phone: "+211 92 000 0003", email: "parts@fbminternational.com" },
    fleet: { label: "Fleet & Corporate", phone: "+211 92 000 0004", email: "fleet@fbminternational.com" },
  },
  seoDefaults: {
    title: "FBM International | Soueast Motor South Sudan",
    description:
      "Sole authorized Soueast Motor dealer in South Sudan. New vehicles, genuine parts, and factory-backed service in Juba.",
  },
  maintenanceMode: false,
  googleBusinessProfileUrl: undefined,
};

export const DEFAULT_USD_TO_SSP = 1300;

export type ResolvedSiteSettings = SiteSettingsData & {
  usdToSsp: number;
};

const readSiteSettings = unstable_cache(
  async (): Promise<ResolvedSiteSettings> => {
    const row = await prisma.siteSetting.findUnique({
      where: { id: "singleton" },
    });

    if (!row) {
      return { ...DEFAULT_SITE_SETTINGS, usdToSsp: DEFAULT_USD_TO_SSP };
    }

    const parsed = siteSettingsDataSchema.safeParse(row.data);
    const data = parsed.success ? parsed.data : DEFAULT_SITE_SETTINGS;

    return { ...data, usdToSsp: Number(row.usdToSsp) };
  },
  ["site-settings"],
  { tags: ["site-settings"] },
);

/** Per-request-memoized, tag-cached site settings. Call `revalidateTag('site-settings', 'max')` after admin saves. */
export const getSiteSettings = cache(readSiteSettings);
