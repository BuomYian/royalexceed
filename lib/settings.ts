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
  companyName: "211Motors",
  phone: "+211 92 000 0000",
  whatsappNumber: "211920000000",
  email: "info@211motors.com",
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
    facebook: "https://facebook.com/211motors",
    instagram: "https://instagram.com/211motors",
    tiktok: "https://tiktok.com/@211motors",
    x: "https://x.com/211motors",
  },
  heroSlides: [],
  departments: {
    sales: { label: "Sales", phone: "+211 91 237 7433", email: "sales@211motors.com" },
    service: { label: "Service", phone: "+211 98 555 6999", email: "service@211motors.com" },
    parts: { label: "Parts", phone: "+211 98 555 6999", email: "parts@211motors.com" },
    fleet: { label: "Fleet & Corporate", phone: "+211 91 237 7433", email: "fleet@211motors.com" },
  },
  seoDefaults: {
    title: "211Motors | Soueast & 212 Vehicles — South Sudan & Sudan",
    description:
      "211Motors, in partnership with FBM International Co., is the sole authorized distributor of Soueast and 212 vehicles in South Sudan and Sudan. New vehicles, genuine parts, and factory-backed service in Juba.",
  },
  maintenanceMode: false,
  googleBusinessProfileUrl: undefined,
};

export type ResolvedSiteSettings = SiteSettingsData;

async function loadSiteSettings(): Promise<ResolvedSiteSettings> {
  const row = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
  });

  if (!row) {
    return DEFAULT_SITE_SETTINGS;
  }

  const parsed = siteSettingsDataSchema.safeParse(row.data);
  return parsed.success ? parsed.data : DEFAULT_SITE_SETTINGS;
}

/**
 * Uncached read, straight from the row — for the admin settings **editor**.
 *
 * The editor must never be populated from `getSiteSettings()`. That read can
 * serve a stale snapshot, and because the form saves back every field it was
 * given, a save would write the stale values into the database and promote a
 * cache artifact into real data. That is not hypothetical: it is how the
 * department emails reverted to @royalexceed.com after the row had already
 * been corrected. Read what is actually stored before offering it for edit.
 */
export function getSiteSettingsForEdit(): Promise<ResolvedSiteSettings> {
  return loadSiteSettings();
}

const readSiteSettings = unstable_cache(
  loadSiteSettings,
  ["site-settings"],
  {
    tags: ["site-settings"],
    // Belt-and-braces alongside the tag. An admin save calls
    // `revalidateTag("site-settings", "max")` for an instant update, but that
    // signal only reaches the deployment the save ran on — editing settings
    // from a local dev server pointed at the production database leaves the
    // deployed Data Cache serving a stale snapshot *indefinitely*, because an
    // `unstable_cache` entry with no `revalidate` never expires on its own.
    // (That is exactly how /contact went on advertising @royalexceed.com
    // addresses for weeks after the database had been corrected.) A 5-minute
    // ceiling lets the site self-heal; the row is a single small record, so
    // re-reading it is cheap.
    revalidate: 300,
  },
);

/** Per-request-memoized, tag-cached site settings. Call `revalidateTag('site-settings', 'max')` after admin saves. */
export const getSiteSettings = cache(readSiteSettings);
