import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // `ar` ships as an English-fallback scaffold today (see spec §3.5 / README) —
    // messages/ar.json exists with the same keys so the site never crashes on /ar/*,
    // even though the copy has not been translated yet.
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
