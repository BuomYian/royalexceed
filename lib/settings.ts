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
  companyName: "Royal Exceed Co. Ltd",
  phone: "+211 92 000 0000",
  whatsappNumber: "211920000000",
  email: "info@royalexceed.com",
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
    facebook: "https://facebook.com/exceedlimited",
    instagram: "https://instagram.com/exceedlimited",
    tiktok: "https://tiktok.com/@exceedlimited",
    x: "https://x.com/exceedlimited",
  },
  heroSlides: [],
  departments: {
    sales: { label: "Sales", phone: "+211 91 237 7433", email: "sales@royalexceed.com" },
    service: { label: "Service", phone: "+211 98 555 6999", email: "service@royalexceed.com" },
    parts: { label: "Parts", phone: "+211 98 555 6999", email: "parts@royalexceed.com" },
    fleet: { label: "Fleet & Corporate", phone: "+211 91 237 7433", email: "fleet@royalexceed.com" },
  },
  seoDefaults: {
    title: "Royal Exceed Co. Ltd | Soueast & 212 Vehicles — South Sudan & Sudan",
    description:
      "Royal Exceed Co. Ltd, in partnership with FBM International Co., is the sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan. New vehicles, genuine parts, and factory-backed service in Juba.",
  },
  maintenanceMode: false,
  googleBusinessProfileUrl: undefined,
};

export type ResolvedSiteSettings = SiteSettingsData;

const readSiteSettings = unstable_cache(
  async (): Promise<ResolvedSiteSettings> => {
    const row = await prisma.siteSetting.findUnique({
      where: { id: "singleton" },
    });

    if (!row) {
      return DEFAULT_SITE_SETTINGS;
    }

    const parsed = siteSettingsDataSchema.safeParse(row.data);
    return parsed.success ? parsed.data : DEFAULT_SITE_SETTINGS;
  },
  ["site-settings"],
  { tags: ["site-settings"] },
);

/** Per-request-memoized, tag-cached site settings. Call `revalidateTag('site-settings', 'max')` after admin saves. */
export const getSiteSettings = cache(readSiteSettings);
