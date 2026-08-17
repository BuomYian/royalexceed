import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: {
    mode: "as-needed", // default locale (en) has no /en prefix; /ar/... for Arabic
  },
});

export type AppLocale = (typeof routing.locales)[number];

export const localeDirections: Record<AppLocale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};
